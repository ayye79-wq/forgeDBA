import { useUser } from "@clerk/react";
import { useGetUserProfile, useCreateCheckoutSession } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, BookOpen, CheckCircle2, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Settings() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { data: profile, isLoading: isProfileLoading } = useGetUserProfile();
  const createCheckoutSession = useCreateCheckoutSession();
  const { toast } = useToast();

  const handleUpgrade = () => {
    createCheckoutSession.mutate(undefined, {
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to initiate checkout. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (!isUserLoaded || isProfileLoading) {
    return (
      <div className="container max-w-4xl px-4 py-12 mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 py-12 mx-auto">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-border/50">
            <div className={`h-24 ${profile?.isPremium ? 'bg-[url(https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop)] bg-cover bg-center' : 'bg-muted'}`}>
              {profile?.isPremium && <div className="w-full h-full bg-primary/40 mix-blend-multiply" />}
            </div>
            <CardContent className="px-6 pb-6 pt-0 relative">
              <Avatar className="h-20 w-20 border-4 border-card absolute -top-10">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-xl">
                  {user?.firstName?.charAt(0) || user?.emailAddresses[0].emailAddress.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="pt-14 space-y-1">
                <h3 className="font-bold text-xl line-clamp-1">{user?.fullName || 'DBA Trainee'}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{user?.primaryEmailAddress?.emailAddress}</p>
                <div className="pt-4">
                  {profile?.isPremium ? (
                    <Badge className="bg-primary text-primary-foreground font-semibold border-none flex w-max">
                      <Shield className="w-3 h-3 mr-1" /> Premium DBA
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground flex w-max">
                      Free Account
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Training Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4 mr-2 text-primary/70" /> Modules
                </div>
                <span className="font-bold text-lg">{profile?.modulesCompleted || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-primary/70" /> Lessons
                </div>
                <span className="font-bold text-lg">{profile?.totalLessonsCompleted || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          {!profile?.isPremium ? (
            <Card className="border-primary/30 shadow-lg shadow-primary/5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-card to-card relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Upgrade to Premium
                  </CardTitle>
                </div>
                <CardDescription className="text-base pt-2 text-foreground/80 max-w-md">
                  Unlock all advanced scenario training, disaster recovery labs, and performance tuning deep dives.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {['Full access to all 5 training modules', 'Interactive disaster recovery simulations', 'Production-grade code examples', 'Priority email support'].map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 mr-3 text-primary shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-6">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8" 
                  onClick={handleUpgrade}
                  disabled={createCheckoutSession.isPending}
                >
                  {createCheckoutSession.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Unlock Full Access Now
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-border/50 border-t-primary border-t-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Shield className="w-6 h-6 text-primary" />
                  Premium Active
                </CardTitle>
                <CardDescription className="text-base pt-2">
                  You have full access to all DBA Forge training materials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Member Since</p>
                    <p className="text-foreground font-semibold">
                      {profile.premiumSince ? format(new Date(profile.premiumSince), 'MMMM d, yyyy') : 'Recently upgraded'}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-primary opacity-50" />
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/modules">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Continue Training <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
          
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Email Address</p>
                <p className="text-sm bg-muted/30 p-2 rounded-md border border-border/40 inline-block font-mono">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <div className="space-y-1 pt-2 border-t border-border/40">
                <p className="text-sm text-muted-foreground font-medium">Authentication</p>
                <p className="text-sm text-foreground/80">
                  Manage your sign-in methods and security settings through your identity provider.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
