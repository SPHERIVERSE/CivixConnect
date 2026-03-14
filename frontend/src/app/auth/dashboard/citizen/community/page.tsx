'use client';

import React, { useEffect, useState, useCallback } from 'react';
import RoleGuard from '@/components/RoleGuard';
import axios from '@/utils/axiosInstance';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface FeedPost {
  id: string;
  author: { id: string; name: string; username?: string | null; avatarUrl?: string | null };
  content: string;
  mediaUrl?: string | null;
  mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO';
  createdAt: string;
  likes: number;
  dislikes: number;
  myReaction: 'like' | 'dislike' | null;
}

interface MediaFile {
    file: File;
    url: string;
    type: 'IMAGE' | 'VIDEO';
}

export default function CommunityFeedPage() {
  const router = useRouter();
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Composer modal state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [localMedia, setLocalMedia] = useState<MediaFile | null>(null);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaType, setMediaType] = useState<'TEXT' | 'IMAGE' | 'VIDEO'>('TEXT');
  const [inputMode, setInputMode] = useState<'FILE' | 'URL'>('FILE');

  // Poll creation state
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollExpiresAt, setPollExpiresAt] = useState('');

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/community/feed'); 
      setFeed(data);
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to sync network feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeed(); }, [fetchFeed]);

  const resetComposer = () => {
    setContent('');
    setLocalMedia(null);
    setMediaUrlInput('');
    setMediaType('TEXT');
    setInputMode('FILE');
    setShowPollForm(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollExpiresAt('');
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();

    if (!trimmedContent && !localMedia && !mediaUrlInput.trim()) {
      setMessage('Transmission cannot be empty.');
      return;
    }

    setIsPosting(true);
    setMessage(null);

    try {
      if (localMedia) {
        const formData = new FormData();
        formData.append('media', localMedia.file);
        if (trimmedContent) {
            formData.append('content', trimmedContent);
        }

        await axios.post('/community/post/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

      } else {
        const finalMediaUrl = mediaUrlInput.trim() || null;
        if (!trimmedContent && !finalMediaUrl) {
             throw new Error('Post must contain content or media'); 
        }
        
        const postData = { 
            content: trimmedContent, 
            mediaUrl: finalMediaUrl, 
            mediaType: finalMediaUrl ? mediaType : 'TEXT' 
        };
        
        await axios.post('/community/post', postData);
      }

      setMessage('✅ Transmission broadcasted successfully!');
      resetComposer();
      setIsComposerOpen(false);
      await fetchFeed();
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to broadcast transmission');
    } finally {
      setIsPosting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setMessage('Only visual or audiovisual feeds are supported.');
        setLocalMedia(null);
        return;
      }

      setLocalMedia({ file, url: URL.createObjectURL(file), type: file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO' });
      setMediaType(file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO');
      setMediaUrlInput(''); 
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2) {
      setMessage('Poll must have a query and at least 2 parameters.');
      return;
    }

    setIsPosting(true);

    try {
      const { data: post } = await axios.post('/community/post', { content: pollQuestion.trim(), mediaUrl: null, mediaType: 'TEXT' });
      const validOptions = pollOptions.filter(opt => opt.trim());
      const expiresAt = pollExpiresAt ? new Date(pollExpiresAt).toISOString() : undefined;
      await axios.post(`/community/post/${post.id}/poll`, { question: pollQuestion.trim(), options: validOptions, expiresAt });

      setMessage('✅ Data collection poll deployed!');
      resetComposer();
      setIsComposerOpen(false);
      await fetchFeed();
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to deploy poll');
    } finally {
      setIsPosting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const addPollOption = () => setPollOptions(prev => [...prev, '']);
  const updatePollOption = (index: number, value: string) => setPollOptions(prev => prev.map((opt, i) => i === index ? value : opt));
  const removePollOption = (index: number) => { if (pollOptions.length > 2) setPollOptions(prev => prev.filter((_, i) => i !== index)); };

  const react = async (postId: string, reactionType: 'like' | 'dislike') => {
    try {
      const { data: updatedPost } = await axios.post(`/community/react/${postId}`, { type: reactionType });
      setFeed(prev => prev.map(p => p.id === postId ? { ...p, likes: updatedPost.likes, dislikes: updatedPost.dislikes, myReaction: updatedPost.myReaction } : p));
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to register protocol');
    }
  };

  return (
    <RoleGuard roles={['CITIZEN', 'WORKER', 'ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
        
        {/* Ambient Tech Glow */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
          
          {/* Header */}
          <header className="mb-6 border-b border-slate-800 pb-4 flex justify-between items-center sticky top-0 bg-slate-950/80 backdrop-blur-xl z-20 rounded-b-2xl px-4 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 tracking-tight">
              CivixConnect Hub
            </h1>
            <div className="flex space-x-3">
              <button onClick={() => router.push('/auth/dashboard/citizen/community/')} className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors shadow-sm">
                Explore 🔍
              </button>
              <button onClick={() => router.push('/auth/dashboard/citizen/community/profile/me')} className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors shadow-sm">
                Profile 👤
              </button>
            </div>
          </header>

          {message && (
            <div className={`mb-6 p-4 rounded-xl border text-sm font-medium backdrop-blur-sm ${
              message.includes('✅') 
                ? 'bg-emerald-900/30 border-emerald-800 text-emerald-300' 
                : 'bg-red-900/30 border-red-800 text-red-300'
            }`}>
              {message}
            </div>
          )}

          {/* Feed */}
          <h2 className="text-xl font-bold mb-6 text-slate-200 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Live Network Feed
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
          ) : (
            <ul className="space-y-6 animate-fade-in-up">
              {feed.map(p => (
                <li key={p.id} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-lg transition-shadow hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-900/30 border border-blue-500/30 overflow-hidden flex items-center justify-center shadow-inner">
                      {p.author.avatarUrl ? (
                        <Image src={p.author.avatarUrl} alt="Profile" width={48} height={48} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-cyan-400">{(p.author.username || p.author.name).charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <button onClick={() => router.push(`/auth/dashboard/citizen/community/profile/${p.author.id}`)} className="text-base font-bold text-white hover:text-cyan-400 transition-colors tracking-tight">
                        {p.author.username || p.author.name}
                      </button>
                      <p className="text-xs font-mono text-slate-500">{new Date(p.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <p className="mb-5 text-slate-300 whitespace-pre-wrap leading-relaxed">{p.content}</p>

                  {p.mediaUrl && (
                    <div className="my-4 max-h-[500px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                      {p.mediaType === 'IMAGE' ? (
                        <img src={p.mediaUrl} alt="Visual Feed" className="w-full h-full object-contain" />
                      ) : p.mediaType === 'VIDEO' ? (
                        <video src={p.mediaUrl} controls className="w-full h-full object-contain" />
                      ) : null}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm mt-4 border-t border-slate-800/50 pt-4">
                    <button onClick={() => react(p.id, 'like')} className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all ${p.myReaction === 'like' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                      {p.likes}
                    </button>
                    <button onClick={() => react(p.id, 'dislike')} className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all ${p.myReaction === 'dislike' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                      {p.dislikes}
                    </button>
                    <a href={`/auth/dashboard/citizen/community/post/${p.id}`} className="flex items-center px-4 py-2 rounded-xl font-semibold text-cyan-400 hover:bg-cyan-900/30 transition-colors ml-auto">
                      View Protocol
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loading && feed.length === 0 && (
            <div className="text-center text-slate-500 p-12 bg-slate-900/40 rounded-3xl border border-slate-800/50 mt-6 font-mono text-sm">
              No network activity detected. Initiate first broadcast.
            </div>
          )}
        </div>

        {/* Floating Compose Button */}
        <button 
          onClick={() => setIsComposerOpen(true)} 
          className="fixed bottom-8 right-8 w-16 h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all z-30"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>

        {/* Composer Modal */}
        {isComposerOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up">
              <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/50">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  New Broadcast
                </h2>
                <button onClick={() => { setIsComposerOpen(false); resetComposer(); }} className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6">
                <div className="flex gap-2 mb-6 bg-slate-950/50 p-1.5 rounded-xl border border-slate-800">
                  <button onClick={() => setShowPollForm(false)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!showPollForm ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>Standard Feed</button>
                  <button onClick={() => setShowPollForm(true)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${showPollForm ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>Data Poll 📊</button>
                </div>

                {!showPollForm ? (
                  <form onSubmit={handleCreatePost}>
                    <textarea 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      placeholder="Enter structural observation or network update..." 
                      className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all" 
                      rows={4} 
                    />

                    <div className="mt-4 flex gap-3">
                      <button type="button" onClick={() => { setInputMode('FILE'); setMediaUrlInput(''); setMediaType('TEXT'); }} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border ${inputMode === 'FILE' ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'}`}>Upload File</button>
                      <button type="button" onClick={() => { setInputMode('URL'); setLocalMedia(null); }} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border ${inputMode === 'URL' ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-400' : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500'}`}>Link URL</button>
                    </div>

                    <div className="mt-4">
                      {inputMode === 'FILE' ? (
                        <div className="border border-slate-700 border-dashed rounded-xl p-4 bg-slate-950/50">
                          <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer" />
                          {localMedia && (
                            <div className="mt-4 relative h-48 w-full overflow-hidden rounded-xl border border-slate-700">
                              {localMedia.type === 'IMAGE' ? (
                                <img src={localMedia.url} alt="Preview" className='w-full h-full object-cover' />
                              ) : (
                                <video src={localMedia.url} controls className='w-full h-full object-cover' />
                              )}
                              <button type="button" onClick={() => setLocalMedia(null)} className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-red-500 transition-colors shadow-lg">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-700">
                          <input type="url" value={mediaUrlInput} onChange={(e) => setMediaUrlInput(e.target.value)} placeholder="https://..." className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                          <select value={mediaType} onChange={(e) => setMediaType(e.target.value as any)} className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 appearance-none">
                            <option value="IMAGE">Static Image Source</option>
                            <option value="VIDEO">Video Stream Source</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end mt-6 pt-6 border-t border-slate-800">
                      <button type="submit" disabled={isPosting} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2">
                        {isPosting ? (
                          <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Transmitting...</>
                        ) : 'Broadcast Data'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleCreatePoll} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Query Parameters</label>
                      <input type="text" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Define poll objective..." className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Data Variables (Options)</label>
                      <div className="space-y-3">
                        {pollOptions.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <input type="text" value={option} onChange={(e) => updatePollOption(index, e.target.value)} placeholder={`Variable ${index + 1}`} className="flex-1 p-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 transition-all" />
                            {pollOptions.length > 2 && (
                              <button type="button" onClick={() => removePollOption(index)} className="px-4 py-2 bg-slate-800 text-red-400 border border-slate-700 rounded-lg hover:bg-red-900/30 hover:border-red-800 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={addPollOption} className="mt-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-cyan-400 border border-cyan-900/50 bg-cyan-900/10 rounded-lg hover:bg-cyan-900/30 transition-colors">
                        + Add Variable
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">Expiration Protocol (Optional)</label>
                      <input type="datetime-local" value={pollExpiresAt} onChange={(e) => setPollExpiresAt(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 transition-all" />
                    </div>

                    <div className="flex justify-end mt-6 pt-6 border-t border-slate-800">
                      <button type="submit" disabled={isPosting} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2">
                        {isPosting ? (
                          <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Deploying...</>
                        ) : 'Deploy Poll'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.4s ease-out forwards;
          }
        `}</style>
      </div>
    </RoleGuard>
  );
}