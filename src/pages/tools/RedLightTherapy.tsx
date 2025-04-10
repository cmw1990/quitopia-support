
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowLeft, ExternalLink, Zap, Sun, Timer } from "lucide-react"

export default function RedLightTherapy() {
  return (
    <ToolAnalyticsWrapper 
      toolName="red-light-therapy"
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
              <CardTitle>Red Light Therapy Guide</CardTitle>
              <CardDescription>
                Compare different red light therapy devices and learn how to optimize your treatment protocol.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-secondary/10">
                  <CardHeader>
                    <Zap className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Power Output</CardTitle>
                    <CardDescription>Device strength comparison</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-secondary/10">
                  <CardHeader>
                    <Sun className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Wavelengths</CardTitle>
                    <CardDescription>Optimal frequencies</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-secondary/10">
                  <CardHeader>
                    <Timer className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Treatment Time</CardTitle>
                    <CardDescription>Duration guidelines</CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-4">Device Comparison</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device Type</TableHead>
                      <TableHead>Power (mW/cm²)</TableHead>
                      <TableHead>Coverage Area</TableHead>
                      <TableHead>Price Range</TableHead>
                      <TableHead>Best For</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Hand-held Device</TableCell>
                      <TableCell>20-50</TableCell>
                      <TableCell>Small area</TableCell>
                      <TableCell>$100-300</TableCell>
                      <TableCell>Targeted treatment</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>LED Panel</TableCell>
                      <TableCell>50-100</TableCell>
                      <TableCell>Medium area</TableCell>
                      <TableCell>$300-700</TableCell>
                      <TableCell>Full body treatment</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Professional Device</TableCell>
                      <TableCell>100-200</TableCell>
                      <TableCell>Large area</TableCell>
                      <TableCell>$1000+</TableCell>
                      <TableCell>Clinical use</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <h2 className="text-xl font-semibold my-4">Treatment Guidelines</h2>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Start with 5-minute sessions</li>
                  <li>Position device 6-12 inches from skin</li>
                  <li>Gradually increase duration</li>
                  <li>Be consistent with daily treatment</li>
                </ol>

                <div className="bg-secondary/20 p-4 rounded-lg mt-6">
                  <h3 className="text-lg font-semibold mb-2">Optimal Wavelengths</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>630-670nm (Red light)</li>
                    <li>810-850nm (Near-infrared)</li>
                    <li>Combination therapy often most effective</li>
                    <li>Different wavelengths for different purposes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scientific Research</CardTitle>
                <CardDescription>Recent studies on red light therapy</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li>
                    <a 
                      href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5523874/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      Effects of Red Light Therapy on Muscle Recovery
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6046211/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      Photobiomodulation and the Brain
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Tools</CardTitle>
                <CardDescription>Enhance your light therapy practice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link to="/tools/sleep-calculator" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Sleep Calculator
                    </Button>
                  </Link>
                  <Link to="/tools/stress-check" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Stress Assessment
                    </Button>
                  </Link>
                  <Link to="/tools/meditation" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Meditation Guide
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
