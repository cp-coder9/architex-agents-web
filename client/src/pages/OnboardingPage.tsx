import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
    const navigate = useNavigate();
    // const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        projectType: 'compliance',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Register user and create project
        console.log('Form submitted:', formData);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Get Started</CardTitle>
                    <CardDescription>Create your account to start your project.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                placeholder="John Doe"
                                required
                                value={formData.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                                type="email"
                                placeholder="john@example.com"
                                required
                                value={formData.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Service Type</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.projectType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, projectType: e.target.value })}
                            >
                                <option value="compliance">Plan Compliance Check</option>
                                <option value="drawing">New Architectural Drawing</option>
                                <option value="alteration">Additions & Alterations</option>
                            </select>
                        </div>
                        <Button type="submit" className="w-full">
                            Create Account & Continue
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button variant="link" onClick={() => navigate('/login')}>
                        Already have an account? Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
