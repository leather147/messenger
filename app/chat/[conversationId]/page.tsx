import { getConversation, getConversationMembers } from "@/lib/actions/conversations"
import { getMessages } from "@/lib/actions/messages"
import { getCurrentUser } from "@/lib/actions/users"
import { ChatWindow } from "@/components/chat/chat-window"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ conversationId: string }>
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params

  try {
    const [conv, messages, members, currentUser] = await Promise.all([
      getConversation(conversationId),
      getMessages(conversationId),
      getConversationMembers(conversationId),
      getCurrentUser(),
    ])

    if (!conv) notFound()

    return (
      <ChatWindow
        conversation={conv}
        initialMessages={messages}
        members={members}
        currentUser={currentUser}
      />
    )
  } catch {
    notFound()
  }
}
