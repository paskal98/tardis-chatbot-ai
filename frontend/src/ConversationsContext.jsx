import { createContext, useState } from "react";
import { useLocalHistory } from "./hooks/useLocalHistory";

/*

type Conversation = Array<{role: "USER" | "AI", text: string, createdAt: Date}>

type HistoryEntry = 
    Array<Conversation>

*/

const BASE_URL = "https://a94f-147-232-36-11.ngrok-free.app"

export const ConversationsContext = createContext({
    conversation: [],
    history: []
});

export function ConversationsProvider({ children }) {
    const [conversation, setConversation] = useState({
        id: crypto.randomUUID(),
        messages: [
            { role: "AI", text: 'Hi, how can I help you?' }
        ]
    });
    const [history, setHistory] = useLocalHistory();

    async function sendMessage(message) {
        setConversation(prev => ({
            ...prev, messages: [...prev.messages, {
                role: "USER",
                text: message
            }]
        }))

        const response = await fetch(`${BASE_URL}/prompt?data=${message}`, {
            headers: {
                "ngrok-skip-browser-warning": "69420",
            }
        });
        const { answer } = await response.json();

        setConversation(prev => ({
            ...prev,
            messages: [...prev.messages, {
                role: "AI",
                text: answer
            }]
        }))
    }

    async function newConversation() {
        setHistory(prev => [...prev, conversation]);
        setConversation({
            id: crypto.randomUUID(),
            messages: []
        })
    }

    async function loadHistoryEntry(id) {
        const target = history.find(h => h.id === id);
        if (!target) return
        setConversation(target);
        await fetch(`${BASE_URL}/set-history`, {
            method: "POST",
            headers: {
                "ngrok-skip-browser-warning": "69420",
                "content-type": "application/json"
            },
            body: JSON.parse(target)
        });
    }

    return <ConversationsContext.Provider value={{ conversation, history, sendMessage, newConversation, loadHistoryEntry }}>
        {children}
    </ConversationsContext.Provider>
}