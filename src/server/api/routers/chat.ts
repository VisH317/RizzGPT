import { z } from "zod";
import { prompts, postPrompt } from "~/server/lib/prompts";

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
        
            let messages: string =  basePrompt + targetPromptData
            console.log("prompt: ", prompt)

            prompt.map(p => {
                console.log("test: ", p)
                messages += `\n\nUser: ${p.user}`
                messages += `\n\nResponse: ${p.system as string}`
            })
            
            messages += `\n\nLast message that requires response: ${input.currentPrompt}`
            messages += targetPromptData
            messages += postPrompt
            console.log("message: ", messages)

            const msg = await ctx.openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [{ role: "system", content: messages }],
                max_tokens: 100,
                temperature: 1
            })

            const ret: string[] = (msg.data.choices[0]?.message?.content as string).split("Score: ")
            ret[0]

            return ret
        }),
});
