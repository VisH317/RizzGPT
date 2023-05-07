type Prompt = {
    prompt: string,
    tries: number,
    hint: string
}

const basePrompt = "You are to act as a person who is getting wooed by someone through text messages. In the next message, I will attempt to woo your personality and pique your interest, and you need to act according to that personality. After each response message you send, you must send 2 newlines followed by a score out of 100 determining this personality's interest in the person. Show the score in the following format: \"\\n\\nScore: {insert your score here}\". Be sure to follow the guidelines of the personality and be selective with who interests you. "
export const postPrompt = "\n\nReturn just the message and the score in the following format: \"Score: {insert score here}\""

export const prompts: Prompt[] = [
    {
        prompt: "For this game, your personality is a person who is easily angered and edgy, but also loves animals. ",
        tries: 10,
        hint: "animals"
    },
    {
        prompt: "first prompt",
        tries: 9,
        hint: "animals"
    },
    {
        prompt: "first prompt",
        tries: 8,
        hint: "animals"
    },
    {
        prompt: "first prompt",
        tries: 7,
        hint: "animals"
    },
    {
        prompt: "first prompt",
        tries: 6,
        hint: "animals"
    },
]

export default basePrompt