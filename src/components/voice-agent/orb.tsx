/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useConversation } from '@elevenlabs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

export function PulseAgentOrb() {
    const conversation = useConversation({
        onConnect: () => console.log('Connected to ElevenLabs'),
        onDisconnect: () => console.log('Disconnected from ElevenLabs'),
        onError: (error) => console.error('ElevenLabs Error:', error),
    });

    const { status, isSpeaking } = conversation;

    const toggleConversation = useCallback(async () => {
        if (status === 'connected') {
            await conversation.endSession();
        } else {
            if (!AGENT_ID) {
                console.error("Missing NEXT_PUBLIC_ELEVENLABS_AGENT_ID. Mocking conversation session for UI purposes.");
                // We'll just ignore for now if there are no keys, or alert the user.
                alert("Please configure NEXT_PUBLIC_ELEVENLABS_AGENT_ID in .env");
                return;
            }
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                await conversation.startSession({ agentId: AGENT_ID } as any);
            } catch (error) {
                console.error("Failed to start conversation:", error);
            }
        }
    }, [status, conversation]);

    const isConnected = status === 'connected';
    const isConnecting = status === 'connecting';

    return (
        <motion.div
            className="fixed bottom-8 right-8 z-50 flex items-center gap-4 flex-col"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
            <AnimatePresence>
                {isConnected && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="backdrop-blur-md bg-zinc-900/80 border border-zinc-800 text-slate-200 text-sm px-4 py-2 rounded-full shadow-2xl flex items-center gap-2"
                    >
                        <div className="flex gap-1 items-center">
                            <span className="relative flex h-2 w-2">
                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isSpeaking ? "bg-amber-400" : "bg-zinc-400")}></span>
                                <span className={cn("relative inline-flex rounded-full h-2 w-2", isSpeaking ? "bg-amber-500" : "bg-zinc-500")}></span>
                            </span>
                            {isSpeaking ? "Agent Speaking" : "Listening..."}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggleConversation}
                disabled={isConnecting}
                className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center shadow-xl backdrop-blur-xl border transition-all duration-300 relative",
                    isConnected
                        ? "bg-zinc-800/80 border-amber-500/50 shadow-amber-500/20"
                        : "bg-zinc-900/90 border-zinc-700 hover:border-zinc-500",
                    isConnecting && "opacity-80 pointer-events-none"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isConnecting ? (
                    <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
                ) : isConnected ? (
                    <MicOff className="w-6 h-6 text-amber-500" />
                ) : (
                    <Mic className="w-6 h-6 text-zinc-300" />
                )}

                {isSpeaking && (
                    <motion.div
                        className="absolute inset-0 rounded-full border border-amber-500"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                )}
            </motion.button>
        </motion.div>
    );
}
