import { Switch, Route, Redirect } from "wouter";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Modules from "@/pages/modules";
import ModulePlayer from "@/pages/module-player";
import QuickReference from "@/pages/quick-reference";
import Settings from "@/pages/settings";
import PaymentSuccess from "@/pages/payment-success";
import Certificate from "@/pages/certificate";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

function SignInPage() {
  return (
    <Layout>
      <div className="flex-1 flex justify-center items-center py-12">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </Layout>
  );
}

function SignUpPage() {
  return (
    <Layout>
      <div className="flex-1 flex justify-center items-center py-12">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </Layout>
  );
}

function HomeRedirect() {
  return (
    <Layout>
      <Home />
    </Layout>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <>
      <Show when="signed-in">
        <Layout>
          <Component />
        </Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
        variables: {
          colorPrimary: 'hsl(20, 90%, 55%)',
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/modules" component={() => <Layout><Modules /></Layout>} />
            <Route path="/modules/:moduleId" component={() => <ProtectedRoute component={ModulePlayer} />} />
            <Route path="/quick-reference" component={() => <Layout><QuickReference /></Layout>} />
            <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
            <Route path="/payment-success" component={() => <ProtectedRoute component={PaymentSuccess} />} />
            <Route path="/certificate" component={() => <ProtectedRoute component={Certificate} />} />
            <Route path="/blog/:slug" component={() => <Layout><BlogPost /></Layout>} />
            <Route path="/blog" component={() => <Layout><Blog /></Layout>} />
            <Route component={() => <Layout><NotFound /></Layout>} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <div className="dark">
      <ClerkProviderWithRoutes />
    </div>
  );
}

export default App;
