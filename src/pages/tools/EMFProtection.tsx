
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/layout/TopNav"
import { ToolAnalyticsWrapper } from "@/components/tools/ToolAnalyticsWrapper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowLeft, ExternalLink, Shield, Zap, Home, Phone } from "lucide-react"

export default function EMFProtection() {
  return (
    <ToolAnalyticsWrapper 
      toolName="emf-protection"
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
              <CardTitle>EMF Protection Guide</CardTitle>
              <CardDescription>
                Compare different EMF protection devices and measurement tools to reduce your exposure to electromagnetic fields.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-secondary/10">
                  <CardHeader>
                    <Shield className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Protection Devices</CardTitle>
                    <CardDescription>EMF shielding products</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-secondary/10">
                  <CardHeader>
                    <Zap className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Measurement Tools</CardTitle>
                    <CardDescription>EMF meters and detectors</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-secondary/10">
                  <CardHeader>
                    <Home className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">Home Solutions</CardTitle>
                    <CardDescription>Whole-house protection</CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-4">EMF Protection Products Comparison</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Type</TableHead>
                      <TableHead>Protection Level</TableHead>
                      <TableHead>Best For</TableHead>
                      <TableHead>Price Range</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>EMF Meters</TableCell>
                      <TableCell>Measurement Only</TableCell>
                      <TableCell>Assessment & Monitoring</TableCell>
                      <TableCell>$100-500</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Phone Shields</TableCell>
                      <TableCell>Moderate</TableCell>
                      <TableCell>Mobile Devices</TableCell>
                      <TableCell>$20-50</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Router Guards</TableCell>
                      <TableCell>High</TableCell>
                      <TableCell>WiFi Protection</TableCell>
                      <TableCell>$50-150</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Protective Clothing</TableCell>
                      <TableCell>Very High</TableCell>
                      <TableCell>Personal Protection</TableCell>
                      <TableCell>$100-300</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <h2 className="text-xl font-semibold my-4">Key EMF Sources to Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-secondary/10 p-4 rounded-lg">
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
                      <Phone className="h-5 w-5" />
                      Mobile Devices
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Use airplane mode when possible</li>
                      <li>Keep devices away from body</li>
                      <li>Use EMF-blocking cases</li>
                    </ul>
                  </div>
                  <div className="bg-secondary/10 p-4 rounded-lg">
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-2">
                      <Home className="h-5 w-5" />
                      Home Environment
                    </h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Shield smart meters</li>
                      <li>Use wired connections</li>
                      <li>Create low-EMF sleep zones</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-primary/10 p-6 rounded-lg mt-6">
                  <h3 className="text-lg font-semibold mb-4">Measurement Guidelines</h3>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>Start with a baseline reading of your environment</li>
                    <li>Identify major EMF sources in your space</li>
                    <li>Measure at different times of day</li>
                    <li>Focus on sleeping areas first</li>
                    <li>Document readings before and after protection measures</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Further Reading</CardTitle>
                <CardDescription>Scientific research on EMF exposure</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li>
                    <a 
                      href="https://www.who.int/news-room/q-a-detail/radiation-electromagnetic-fields"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      WHO Guidelines on EMF Exposure
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6701402/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      Effects of EMF on Human Health
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Tools</CardTitle>
                <CardDescription>Complement your EMF protection strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link to="/tools/grounding-earthing" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Grounding/Earthing Guide
                    </Button>
                  </Link>
                  <Link to="/tools/sleep-calculator" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      Sleep Optimization
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
