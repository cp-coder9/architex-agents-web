import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { HardHat, CheckCircle, FileText, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <HardHat className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl">ArchiTex Agents</span>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/login')}>Login</Button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1">
                <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                            Automated Architectural Compliance <br className="hidden sm:inline" />
                            <span className="text-primary">Powered by AI Agents</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Upload your plans, get instant compliance checks against SANS regulations, and commission new drawings seamlessly.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Button size="lg" onClick={() => navigate('/onboarding')} className="text-lg px-8">
                                Start Plan Check <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            <Card>
                                <CardHeader>
                                    <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                                    <CardTitle>Instant Compliance</CardTitle>
                                    <CardDescription>
                                        AI agents scan your plans for SANS 10400 compliance, checking walls, windows, and dimensions.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <FileText className="h-8 w-8 text-blue-500 mb-2" />
                                    <CardTitle>Seamless Uploads</CardTitle>
                                    <CardDescription>
                                        Upload PDF or CAD files. Our vision system extracts metadata and visualizes your project.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <HardHat className="h-8 w-8 text-orange-500 mb-2" />
                                    <CardTitle>Expert Freelancers</CardTitle>
                                    <CardDescription>
                                        Connect with vetted architectural professionals for complex amendments and new drawings.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t py-8 text-center text-sm text-muted-foreground">
                © 2025 ArchiTex Agents. All rights reserved.
            </footer>
        </div>
    );
}
