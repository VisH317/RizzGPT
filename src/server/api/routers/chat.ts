import { z } from "zod";
import prompts from "~/server/lib/prompts";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const message = z.object({
    user: z.string(),
    chat: z.string()
})

const req = z.object({
    level: z.number(),
    prompt: z.array(message)
})

const res = z.object({
    hasFailed: z.boolean(),
    responseArr: z.string()
})

interface Message {
    role: "system" | "user" | "assistant",
    prompt: string
}

export const chatRouter = createTRPCRouter({
    hello: publicProcedure
        .input(req)
        .query(({ input, ctx }) => {
            const { prompt, level } = input
            const targetPromptData = prompts[level-1]
        
            const messages: Message[] = [{ role: "system", prompt: targetPromptData?.prompt as string }]

            const assistant = prompt.map(p => {
                messages.push({ role: "assistant", prompt: `User: ${p.user}` })
                messages.push({ role: "assistant", prompt: `Chat: ${p.chat}` })
            })
        }),
});
