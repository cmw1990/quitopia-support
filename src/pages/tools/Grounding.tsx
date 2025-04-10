import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowLeft, ExternalLink } from "lucide-react"

export default function Grounding() {
  return (
    <ToolAnalyticsWrapper 
      toolName="grounding-earthing"
      toolType="biohacking"
      toolSettings={{}}
    >
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <Link to="/tools">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tools
              </Button>
            </Link>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Grounding/Earthing Guide</CardTitle>
              <CardDescription>
                Compare grounding mats and other earthing devices to improve your connection with the Earth's natural energy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-4">What is Grounding?</h2>
                <p className="text-muted-foreground mb-4">
                  Grounding, also known as earthing, is the practice of making direct contact with the Earth's surface 
                  or using conductive systems that transfer the Earth's electrons into your body. This practice may help 
                  reduce inflammation, improve sleep, and decrease stress levels.
                </p>

                <h2 className="text-xl font-semibold mb-4">Popular Grounding Products</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Type</TableHead>
                      <TableHead>Benefits</TableHead>
                      <TableHead>Best For</TableHead>
                      <TableHead>Price Range</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Grounding Mats</TableCell>
                      <TableCell>Easy to use while working or sleeping</TableCell>
                      <TableCell>Indoor use, office workers</TableCell>
                      <TableCell>$30-100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Earthing Sheets</TableCell>
                      <TableCell>Full-body contact during sleep</TableCell>
                      <TableCell>Sleep improvement</TableCell>
                      <TableCell>$50-200</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Grounding Bands</TableCell>
                      <TableCell>Portable, can be worn all day</TableCell>
                      <TableCell>Travel, continuous use</TableCell>
                      <TableCell>$20-50</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <h2 className="text-xl font-semibold my-4">Getting Started</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Start with direct earth contact (walking barefoot on grass/sand)</li>
                  <li>Consider a simple grounding mat for your workspace</li>
                  <li>Progress to grounding sheets for sleep optimization</li>
                  <li>Use grounding bands for mobility</li>
                </ol>

                <div className="bg-secondary/20 p-4 rounded-lg mt-6">
                  <h3 className="text-lg font-semibold mb-2">Pro Tips</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Ground for at least 30 minutes daily</li>
                    <li>Combine with deep breathing exercises</li>
                    <li>Stay hydrated for better conductivity</li>
                    <li>Use during high-stress periods</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scientific Research</CardTitle>
                <CardDescription>Recent studies on grounding benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li>
                    <a 
                      href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3265077/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      Earthing: Health Implications of Reconnecting the Human Body to the Earth's Surface Electrons
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4378297/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      The effects of grounding on inflammation, the immune response, wound healing
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Tools</CardTitle>
                <CardDescription>Enhance your grounding practice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link to="/tools/breathing-exercises">
                    <Button variant="outline" className="w-full justify-start">
                      Breathing Exercises
                    </Button>
                  </Link>
                  <Link to="/tools/stress-check">
                    <Button variant="outline" className="w-full justify-start">
                      Stress Assessment
                    </Button>
                  </Link>
                  <Link to="/dashboard/meditation">
                    <Button variant="outline" className="w-full justify-start">
                      Full Meditation Guide (Web App)
                    </Button>
                  </Link>
                  <Link to="/dashboard/focus">
                    <Button variant="outline" className="w-full justify-start">
                      Focus Tools (Web App)
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolAnalyticsWrapper>
  )
}
