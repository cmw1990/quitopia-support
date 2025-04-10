
import React from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

export default function SleepGuideArticle() {
  const { slug } = useParams()

  const { data: guide, isLoading } = useQuery({
    queryKey: ['sleep_guide', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sleep_guides')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()
      
      if (error) throw error
      return data
    }
  })

  return (
    <ToolAnalyticsWrapper 
      toolName="sleep-guide"
      toolType="education"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <div className="mb-4">
            <Link to="/tools/sleep-guide">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sleep Guide
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <Card>
              <CardHeader>
                <CardTitle>Loading...</CardTitle>
              </CardHeader>
            </Card>
          ) : guide ? (
            <article className="prose prose-lg max-w-none">
              <Card>
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {guide.content.split('\n\n').map((paragraph, index) => {
                    if (paragraph.startsWith('#')) {
                      return <h2 key={index} className="text-2xl font-bold mt-6 mb-4">{paragraph.replace('# ', '')}</h2>
                    }
                    if (paragraph.includes('- ')) {
                      const [title, ...items] = paragraph.split('\n')
                      return (
                        <div key={index} className="mb-6">
                          {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
                          <ul className="list-disc pl-6 space-y-2">
                            {items.map((item, i) => (
                              <li key={i}>{item.replace('- ', '')}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    }
                    return <p key={index} className="mb-4">{paragraph}</p>
                  })}
                </CardContent>
              </Card>
            </article>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Guide not found</CardTitle>
              </CardHeader>
              <CardContent>
                <p>The requested guide could not be found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}
