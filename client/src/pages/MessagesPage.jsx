import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '../services/api';
import { Button, Card, Loading } from '../components/common';

export default function MessagesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['contact-requests'],
    queryFn: () => contactsApi.getAll(),
    select: (response) => response.data
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ id, content }) => contactsApi.sendMessage(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries(['contact-requests']);
      queryClient.invalidateQueries(['contact-requests-unread']);
      setReplyMessage('');
    }
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, status }) => contactsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['contact-requests']);
      queryClient.invalidateQueries(['contact-requests-unread']);
    }
  });

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && selectedConversation) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation?.messages]);

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const currentUserId = getCurrentUserId();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (replyMessage.trim() && selectedConversation) {
      sendMessageMutation.mutate({
        id: selectedConversation.id,
        content: replyMessage.trim()
      });
    }
  };

  // Combine and sort all conversations
  const allConversations = [
    ...(requestsData?.received || []).map(r => ({ ...r, type: 'received' })),
    ...(requestsData?.sent || []).map(r => ({ ...r, type: 'sent' }))
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  if (isLoading) {
    return (
      <div className="container-page">
        <Loading className="py-12" />
      </div>
    );
  }

  return (
    <div className="container-page">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('nav.messages')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations list */}
        <div className={`lg:col-span-1 ${selectedConversation ? 'hidden lg:block' : ''}`}>
          <Card>
            <Card.Body className="p-0">
              {allConversations.length > 0 ? (
                <div className="divide-y">
                  {allConversations.map((conv) => {
                    const isReceived = conv.type === 'received';
                    const otherParty = isReceived
                      ? conv.fromUser?.phone
                      : `${conv.toProfile?.firstName} ${conv.toProfile?.lastName || ''}`;
                    const lastMessage = conv.messages?.[conv.messages.length - 1];
                    const hasUnread = conv.messages?.some(
                      msg => !msg.isRead && msg.senderId !== currentUserId
                    );

                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          selectedConversation?.id === conv.id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate flex items-center gap-2">
                              {otherParty}
                              {hasUnread && (
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </p>
                            {lastMessage && (
                              <p className="text-sm text-gray-500 truncate mt-1">
                                {lastMessage.content}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                conv.status === 'accepted'
                                  ? 'bg-green-100 text-green-700'
                                  : conv.status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {t(`dashboard.requests.${conv.status}`)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {t('dashboard.requests.noMessages')}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Conversation view */}
        <div className={`lg:col-span-2 ${!selectedConversation ? 'hidden lg:block' : ''}`}>
          {selectedConversation ? (
            <Card className="h-[600px] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.type === 'received'
                        ? selectedConversation.fromUser?.phone
                        : `${selectedConversation.toProfile?.firstName} ${selectedConversation.toProfile?.lastName || ''}`}
                    </h3>
                    {selectedConversation.type === 'sent' && selectedConversation.toProfile && (
                      <Link
                        to={`/profile/${selectedConversation.toProfile.id}`}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        {t('dashboard.requests.viewConversation')}
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    selectedConversation.status === 'accepted'
                      ? 'bg-green-100 text-green-700'
                      : selectedConversation.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {t(`dashboard.requests.${selectedConversation.status}`)}
                  </span>
                  {selectedConversation.type === 'received' && selectedConversation.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateRequestMutation.mutate({ id: selectedConversation.id, status: 'accepted' })}
                        loading={updateRequestMutation.isPending}
                      >
                        {t('dashboard.requests.accept')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => updateRequestMutation.mutate({ id: selectedConversation.id, status: 'rejected' })}
                        loading={updateRequestMutation.isPending}
                      >
                        {t('dashboard.requests.reject')}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedConversation.messages?.length > 0 ? (
                  selectedConversation.messages.map((msg) => {
                    const isMyMessage = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isMyMessage
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMyMessage ? 'text-indigo-200' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    {t('dashboard.requests.noMessages')}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={t('dashboard.requests.typeMessage')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <Button
                    type="submit"
                    loading={sendMessageMutation.isPending}
                    disabled={!replyMessage.trim()}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>{t('dashboard.requests.noMessages')}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
