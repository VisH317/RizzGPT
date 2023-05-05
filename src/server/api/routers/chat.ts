import { z } from "zod";
import prompts from "~/server/lib/prompts";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
        .mutation(async ({ input, ctx }) => {
            const { prompt, level } = input
            const targetPromptData = prompts[level-1]
        
            let messages: Message[] = [{ role: "system", content: targetPromptData?.prompt as string }]

            prompt.slice(0, prompts.length-1).map(p => {
                messages.push({ role: "assistant", content: `User: ${p.user}` })
                messages.push({ role: "assistant", content: `Chat: ${p.system}` })
            })
            
            messages.push({ role: "user", content: `${input.currentPrompt}\n\nAdd a score out of 100 for the user representing how well they are doing in winning over the person you are representing, add the score 2 newlines after the main response message` })

            const msg = await ctx.openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages,
                max_tokens: 100,
                temperature: 1
            })

            let ret: string[] = (msg.data.choices[0]?.message?.content as string).split("\n\n")

            return ret
        }),
});
