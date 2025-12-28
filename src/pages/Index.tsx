import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">CTC</h1>
          <span className="text-sm text-muted-foreground">Complaint Tracker Companion</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Complaint Tracker Companion
          </h2>
          <p className="text-lg text-muted-foreground">
            A simple and efficient way to submit and track campus complaints.
            Get your issues resolved faster with our streamlined complaint management system.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-border">
            <CardHeader className="text-center">
              <FileText className="w-10 h-10 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">Easy Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Submit complaints with just a few clicks. Categorize and describe your issue easily.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="text-center">
              <Users className="w-10 h-10 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Monitor the status of your complaints in real-time. Stay informed at every step.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="text-center">
              <Shield className="w-10 h-10 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Your complaints are secure. Only you and authorized admins can view your submissions.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons - Admin Login REMOVED */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/student-login">
            <Button size="lg" className="w-48">
              Student Login
            </Button>
          </Link>
          <Link to="/student-signup">
            <Button size="lg" variant="outline" className="w-48">
              Student Signup
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 CTC - Complaint Tracker Companion. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
