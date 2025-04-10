import React, { useState } from 'react'

export interface CommunityProps {
  session?: any
}

interface Post {
  id: string
  author: {
    name: string
    avatar: string
    role: 'member' | 'moderator' | 'expert'
  }
  content: string
  likes: number
  comments: number
  tags: string[]
  date: string
  liked?: boolean
}

interface FocusGroup {
  id: string
  name: string
  members: number
  description: string
  tags: string[]
  image?: string
}

export const Community: React.FC<CommunityProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'events' | 'resources'>('feed')
  
  // Mock data for community feed
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Jamie Chen',
        avatar: '/avatars/jamie.jpg',
        role: 'member'
      },
      content: "Just completed a 3-hour deep work session using the Pomodoro technique. It's amazing how much I can get done when I properly manage distractions!",
      likes: 24,
      comments: 7,
      tags: ['pomodoro', 'productivity', 'deepwork'],
      date: '2 hours ago'
    },
    {
      id: '2',
      author: {
        name: 'Dr. Sarah Williams',
        avatar: '/avatars/sarah.jpg',
        role: 'expert'
      },
      content: "TIP: For those with ADHD, environmental modifications can make a huge difference. Consider noise-cancelling headphones, a clean workspace, and natural lighting to minimize distractions.",
      likes: 45,
      comments: 12,
      tags: ['adhd', 'environment', 'tips'],
      date: '5 hours ago'
    },
    {
      id: '3',
      author: {
        name: 'Miguel Rodriguez',
        avatar: '/avatars/miguel.jpg',
        role: 'member'
      },
      content: "Has anyone tried body doubling for focus? I'm looking for partners who want to do virtual co-working sessions. Drop a comment if interested!",
      likes: 18,
      comments: 32,
      tags: ['bodydoubling', 'collaboration', 'virtual'],
      date: '8 hours ago'
    },
    {
      id: '4',
      author: {
        name: 'Taylor Johnson',
        avatar: '/avatars/taylor.jpg',
        role: 'moderator'
      },
      content: "NEW RESOURCE ADDED: We've added a comprehensive guide on managing energy levels throughout the day. Check it out in the Resources tab!",
      likes: 37,
      comments: 8,
      tags: ['energy', 'resources', 'announcement'],
      date: '1 day ago'
    }
  ])
  
  // Mock data for focus groups
  const [focusGroups] = useState<FocusGroup[]>([
    {
      id: '1',
      name: 'ADHD Professionals',
      members: 1243,
      description: 'A supportive community for professionals with ADHD sharing workplace strategies and tips.',
      tags: ['adhd', 'work', 'career'],
      image: '/groups/professionals.jpg'
    },
    {
      id: '2',
      name: 'Deep Work Club',
      members: 876,
      description: "Dedicated to implementing Cal Newport's Deep Work principles into daily practice.",
      tags: ['deepwork', 'productivity', 'focus'],
      image: '/groups/deepwork.jpg'
    },
    {
      id: '3',
      name: 'Daily Pomodoro Sessions',
      members: 1547,
      description: 'Group for daily scheduled pomodoro sessions. Join us for accountability and consistency!',
      tags: ['pomodoro', 'accountability', 'daily'],
      image: '/groups/pomodoro.jpg'
    },
    {
      id: '4',
      name: 'Energy & Focus Optimization',
      members: 654,
      description: 'Exploring the connection between physical energy management and mental focus.',
      tags: ['energy', 'productivity', 'health'],
      image: '/groups/energy.jpg'
    }
  ])
  
  // Mock upcoming events data
  const [upcomingEvents] = useState([
    {
      id: '1',
      title: 'Deep Work Workshop',
      date: 'June 15, 2023 • 2:00 PM EST',
      host: 'Dr. Alex Turner',
      attendees: 127,
      description: 'Learn practical deep work techniques and establish your own deep work routine.'
    },
    {
      id: '2',
      title: 'ADHD & Focus: Ask Me Anything',
      date: 'June 18, 2023 • 1:00 PM EST',
      host: 'Dr. Sarah Williams',
      attendees: 89,
      description: 'Live Q&A with expert ADHD coach Dr. Williams answering your questions about focus strategies.'
    },
    {
      id: '3',
      title: 'Group Pomodoro Marathon',
      date: 'June 20, 2023 • 9:00 AM EST',
      host: 'Productivity Club',
      attendees: 215,
      description: 'Join us for a 4-hour pomodoro marathon with breaks and group check-ins.'
    }
  ])
  
  // Mock resources data
  const [resources] = useState([
    {
      id: '1',
      title: 'The Ultimate Guide to Managing ADHD at Work',
      type: 'PDF Guide',
      author: 'Dr. Sarah Williams',
      downloads: 1243
    },
    {
      id: '2',
      title: 'Focus-Friendly Music Playlists',
      type: 'Audio Collection',
      author: 'Focus Sound Lab',
      downloads: 876
    },
    {
      id: '3',
      title: '10-Day Focus Challenge',
      type: 'Interactive Program',
      author: 'Easier Focus Team',
      downloads: 1547
    },
    {
      id: '4',
      title: 'Understanding Energy Patterns & Focus',
      type: 'Video Course',
      author: 'Energy & Productivity Institute',
      downloads: 654
    }
  ])
  
  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
          liked: !post.liked
        }
      }
      return post
    }))
  }
  
  const renderAuthorBadge = (role: 'member' | 'moderator' | 'expert') => {
    switch (role) {
      case 'moderator':
        return <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full">Mod</span>
      case 'expert':
        return <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 rounded-full">Expert</span>
      default:
        return null
    }
  }

  return (
    <div className="community max-w-6xl mx-auto">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-2">Focus Community</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect with others, share strategies, and support each other on your focus journey
          </p>
          
          <div className="flex overflow-x-auto space-x-2 pb-2">
            <button 
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'feed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setActiveTab('feed')}
            >
              Community Feed
            </button>
            <button 
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'groups' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setActiveTab('groups')}
            >
              Focus Groups
            </button>
            <button 
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'events' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setActiveTab('events')}
            >
              Upcoming Events
            </button>
            <button 
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${activeTab === 'resources' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
              onClick={() => setActiveTab('resources')}
            >
              Resources
            </button>
          </div>
        </div>
        
        {/* Community Feed */}
        {activeTab === 'feed' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            {/* Post composer */}
            <div className="post-composer mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
                <div className="flex-grow">
                  <textarea 
                    placeholder="Share a focus tip, ask a question, or tell us about your progress..."
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  ></textarea>
                  <div className="flex justify-between mt-3">
                    <div className="space-x-2">
                      <button className="text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Image
                        </span>
                      </button>
                      <button className="text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Tags
                        </span>
                      </button>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Posts feed */}
            <div className="posts-feed space-y-6">
              {posts.map(post => (
                <div key={post.id} className="post p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="post-header flex justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800 dark:text-white mr-2">{post.author.name}</span>
                          {renderAuthorBadge(post.author.role)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{post.date}</div>
                      </div>
                    </div>
                    <button className="text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                  <div className="post-content mb-3">
                    <p className="text-gray-800 dark:text-gray-200">{post.content}</p>
                  </div>
                  <div className="post-tags flex flex-wrap gap-2 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="post-actions flex justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center ${post.liked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill={post.liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      {post.likes}
                    </button>
                    <button className="flex items-center text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.comments}
                    </button>
                    <button className="flex items-center text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Focus Groups */}
        {activeTab === 'groups' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Focus Groups</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create Group
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {focusGroups.map(group => (
                <div key={group.id} className="group bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div className="h-32 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{group.name}</h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{group.members} members</div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{group.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {group.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Join Group
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Upcoming Events */}
        {activeTab === 'events' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Upcoming Events</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create Event
              </button>
            </div>
            
            <div className="space-y-6">
              {upcomingEvents.map(event => (
                <div key={event.id} className="event bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{event.date}</div>
                      <div className="text-sm mb-2">Hosted by <span className="font-medium">{event.host}</span> • {event.attendees} attending</div>
                      <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
                    </div>
                    <div className="flex items-start">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Resources */}
        {activeTab === 'resources' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Focus Resources</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map(resource => (
                <div key={resource.id} className="resource bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex">
                    <div className="mr-4 flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      {resource.type === 'PDF Guide' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                      {resource.type === 'Audio Collection' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      )}
                      {resource.type === 'Interactive Program' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      {resource.type === 'Video Course' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-1">{resource.title}</h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{resource.type} by {resource.author}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{resource.downloads} downloads</div>
                    </div>
                    <div className="ml-4">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 