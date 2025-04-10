
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowLeft, ExternalLink, Snowflake, Bath, Thermometer } from "lucide-react"

export default function ColdTherapy() {
  return (
    <ToolAnalyticsWrapper 
      toolName="cold-therapy-tools"
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
              <CardTitle>Cold Therapy Guide</CardTitle>
              <CardDescription>
                Compare ice baths, cold plunge tubs, and cryotherapy options to optimize your cold exposure practice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-secondary/10">
                  <CardHeader>
                    <Snowflake className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Cold Plunge</CardTitle>
                    <CardDescription>Home cold immersion</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-secondary/10">
                  <CardHeader>
                    <Bath className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Ice Baths</CardTitle>
                    <CardDescription>DIY cold therapy</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-secondary/10">
                  <CardHeader>
                    <Thermometer className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Cryotherapy</CardTitle>
                    <CardDescription>Professional treatment</CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-4">Cold Therapy Methods Comparison</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Temperature Range</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Cost Range</TableHead>
                      <TableHead>Benefits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Cold Plunge Tub</TableCell>
                      <TableCell>38-45°F (3-7°C)</TableCell>
                      <TableCell>2-10 minutes</TableCell>
                      <TableCell>$3000-10000</TableCell>
                      <TableCell>Recovery, inflammation, mood</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Ice Bath</TableCell>
                      <TableCell>50-59°F (10-15°C)</TableCell>
                      <TableCell>5-15 minutes</TableCell>
                      <TableCell>$50-200</TableCell>
                      <TableCell>Muscle recovery, immunity</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cryotherapy</TableCell>
                      <TableCell>-166°F (-110°C)</TableCell>
                      <TableCell>2-4 minutes</TableCell>
                      <TableCell>$60-100/session</TableCell>
                      <TableCell>Pain relief, skin health</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <h2 className="text-xl font-semibold my-4">Getting Started Guide</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Start with cold showers (30-60 seconds)</li>
                  <li>Progress to ice baths (2-3 minutes)</li>
                  <li>Build up to longer exposures</li>
                  <li>Consider investing in dedicated equipment</li>
                </ol>

                <div className="bg-secondary/20 p-4 rounded-lg mt-6">
                  <h3 className="text-lg font-semibold mb-2">Safety Guidelines</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Never practice cold exposure alone</li>
                    <li>Start with shorter durations</li>
                    <li>Listen to your body</li>
                    <li>Exit if you feel extreme discomfort</li>
                    <li>Warm up gradually afterward</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Research & Studies</CardTitle>
                <CardDescription>Scientific evidence for cold therapy</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li>
                    <a 
                      href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5411446/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      Cold water immersion: kill or cure?
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4049052/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      The Effect of Post-Exercise Cryotherapy on Recovery
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Tools</CardTitle>
                <CardDescription>Enhance your cold therapy practice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link to="/tools/breathing-exercises" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Breathing Exercises
                    </Button>
                  </Link>
                  <Link to="/tools/meditation" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Meditation Guide
                    </Button>
                  </Link>
                  <Link to="/tools/stress-check" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Stress Assessment
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
