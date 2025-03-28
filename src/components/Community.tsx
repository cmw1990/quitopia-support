import React from 'react';
import { Session } from '@supabase/supabase-js';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Avatar, 
  AvatarFallback, 
  AvatarImage,
  Button
} from './ui';
import { supabaseRestCall } from "../api/apiCompatibility";
import toast from 'react-hot-toast';

interface CommunityProps {
  session: Session | null;
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    full_name: string;
    avatar_url: string;
  };
  likes: number;
}

export const Community: React.FC<CommunityProps> = ({ session }) => {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (session?.user) {
      loadCommunityPosts();
    }
  }, [session]);

  const loadCommunityPosts = async () => {
    try {
      const data = await supabaseRestCall(
        `/rest/v1/community_posts?select=*,user_id(id,email,username,avatar_url)&order=created_at.desc`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': session ? `Bearer ${session.access_token}` : '',
            'Content-Type': 'application/json'
          }
        },
        session
      );
      
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error('Invalid data format returned from API');
        toast.error('Failed to load community posts');
      }
    } catch (error) {
      console.error('Error loading community posts:', error);
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Community Support</h1>
        <Button>Share Your Story</Button>
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar>
                <AvatarImage src={post.user.avatar_url} />
                <AvatarFallback>
                  {post.user.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{post.user.full_name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{post.content}</p>
              <div className="flex items-center gap-4 mt-4">
                <Button variant="ghost" size="sm">
                  ❤️ {post.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  💬 Comment
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Be supportive and encouraging to fellow quitters</li>
            <li>Share your experiences and tips</li>
            <li>Celebrate milestones together</li>
            <li>Keep discussions respectful and constructive</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
