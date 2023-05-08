import { z } from "zod";
import { prompts, postPrompt, scorePrompt } from "~/server/lib/prompts";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import basePrompt from "~/server/lib/prompts";

const message = z.object({
    user: z.string(),
    system: z.optional(z.string())
})

const req = z.object({
    level: z.number(),
    prompt: z.array(message),
    currentPrompt: z.string()
})

const res = z.object({
    hasFailed: z.boolean(),
    responseArr: z.string()
})

interface Message {
    role: "system" | "user" | "assistant",
    content: string
}

export const chatRouter = createTRPCRouter({
    chat: publicProcedure
        .input(req)
        .mutation( async ({ input, ctx }) => {
            const { prompt, level } = input
            const targetPromptData = prompts[level]?.prompt as string
        
            const system: string =  basePrompt + targetPromptData
            let assistant = `User: ${prompt[0]?.user as string}\n\nResponse: ${prompt[0]?.system as string}`
            console.log("prompt: ", prompt)

            if(prompt.length>=1) {
                prompt.slice(1).map(p => {
                    console.log("test: ", p)
                    assistant += `\n\nUser: ${p.user}`
                    assistant += `\n\nResponse: ${p.system as string}`
                })
            }
            
            const user = `Last message that requires response: ${input.currentPrompt}`
            // messages += targetPromptData
            // messages += postPrompt
            console.log("message: ", assistant)

            try {

                const msg = await ctx.openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "system", content: system }, { role: "assistant", content: assistant }, { role: "user", content: user }],
                    max_tokens: 100,
                    temperature: 0.5,
                    stop: ["\n"]
                })

                let ret: string = (msg.data.choices[0]?.message?.content as string)
                console.log("ret: ", ret)
                ret = ret.replace(/(\r\n|\n|\r)/gm, "")
                ret = ret.replace("Response: ", "")
    
                assistant += `\n\nUser: ${input.currentPrompt}`
                assistant += `\n\nResponse: ${ret}`
    
                const score = await ctx.openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "system", content: scorePrompt }, { role: "user", content: assistant }],
                    max_tokens: 100,
                    temperature: 1
                })

                console.log("score: ", score)
    
                console.log("test: ", score.data.choices[0]?.message?.content)
                const processedScore = parseInt((score.data.choices[0]?.message?.content as string).split("Score: ")[1] as string)
                const out = [ret, processedScore]
                console.log("out: ", out)
    
                return out

            } catch (e) {
                return ["nothing", 0]
            }
        }),
});
