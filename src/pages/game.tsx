import React, { useState, useEffect } from 'react'
import { api } from '~/utils/api'
import { prompts } from '~/server/lib/prompts'
import { Source_Serif_Pro } from 'next/font/google'

export default function Game() {
    const [level, setLevel] = useState<number>(0)
    const [messages, setMessages] = useState<Message[]>([])
    const [cur, setCur] = useState<string>("")
    const [score, setScore] = useState<number>(0)

    const chat = api.chat.chat.useMutation()

    const mapMessages = () => {
        return messages.map((m, idx) => (
            <div className="w-full flex flex-col gap-5" key={idx}>
                <div className="w-full flex flex-row justify-end">
                    <div className="w-1/2 rounded-lg bg-blue-500 p-2">
                        {m.user}
                    </div>
                </div>
                {m.system ? (<div className="w-full flex flex-row justify-start">
                    <div className="w-1/2 rounded-lg bg-gray-700 p-2">
                        {m.system}
                    </div>
                </div>) : <></>}
            </div>
        ))
    }

    const submitMessage = async () => {
        const msg: Message = { user: cur }
        setMessages(msgs => [...msgs, msg])
        console.log("MESSAGES:", messages)
        const res: [string, number] = await chat.mutateAsync({ level, prompt: messages.slice(0, messages.length-1), currentPrompt: msg.user }) as [string, number]
        setMessages(msgs => {
            const mutableMsg = [...msgs]
            mutableMsg[msgs.length-1] = { user: msgs[msgs.length-1]?.user as string, system: res[0] }
            return mutableMsg
        })
        if(res[0]?.length===0 || res[1]<=20 || (messages.length>=10 && res[1]<70) || res.length<2) {
            setMessages([])
            setScore(0)
            alert("You have failed miserably in attempting to showcase your rizz, and you have been determined to have negative rizz. Kinda sad ngl")
        }
        setScore(res[1])
    }

    return (
        <div className="flex min-h-screen max-[800px]:flex-col min-[800px]:flex-row bg-gradient-to-b from-black to-[#15162c]">
            <div className="w-1/2 max-[800px]:w-full p-20 max-[800px]:p-10 border-r-2 border-slate-700">
                <p className="text-white font-bold text-6xl"><span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-fuchsia-500'>Rizz</span>GPT: Level {level+1}</p>
                <div className='h-4'/>
                <p className="text-slate-200 font-normal text-xl">Your objective is to rizz the person up within {prompts[level]?.tries} tries</p>
                <div className='h-2'/>
                <p className="text-slate-400 font-light text-xl">Description: {prompts[level]?.prompt}</p>
                <div className="h-2"/>
                <p className="text-slate-200 font-bold text-2xl">Score: {score}</p>
            </div>
            <div className="px-20 max-[800px]:px-10 py-10 w-1/2 max-[800px]:w-full flex flex-col gap-5">
                <div className="grow w-full overflow-auto gap-5 flex flex-col max-[800px]:h-96">
                    {mapMessages()}
                </div>
                <div className='flex-none w-full flex flex-row'>
                    <textarea className="w-[90%] bg-slate-600 rounded-tl-lg rounded-bl-lg text-slate-300 outline-none border-slate-500 border-2 p-5" style={{ resize: "none" }} value={cur} onChange={e => setCur(e.target.value)}/>
                    <button className='w-[10%] max-[800px]:w-24 bg-gradient-to-r from-blue-500 to-fuchsia-500 rounded-tr-lg rounded-br-lg flex justify-center items-center group' onClick={() => void submitMessage()}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className='group-hover:-translate-y-1 duration-300'><path fill="white" d="M24 0l-6 22-8.129-7.239 7.802-8.234-10.458 7.227-7.215-1.754 24-12zm-15 16.668v7.332l3.258-4.431-3.258-2.901z"/></svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

interface Message {
    system?: string,
    user: string
}
