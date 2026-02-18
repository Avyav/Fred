"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { FredMorphIcon } from "@/components/ui/fred-morph-icon";
import {
  Phone,
  LogOut,
  User,
  ShieldAlert,
  Settings,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { data: session } = useSession();

  const initials = session?.user?.email
    ? session.user.email.substring(0, 2).toUpperCase()
    : "?";

  const isAdmin = session?.user?.email?.endsWith("@admin.mindsupport.vic.gov.au");

  return (
    <header className="border-b border-purple-100/60 backdrop-blur-md bg-background/80">
      {/* Crisis banner */}
      <div
        role="banner"
        className="bg-destructive text-destructive-foreground px-4 py-1.5 text-center text-xs"
      >
        <Phone className="inline-block h-3 w-3 mr-1" aria-hidden="true" />
        Emergency:{" "}
        <a href="tel:000" className="underline font-bold" aria-label="Call emergency services triple zero">
          000
        </a>
        {" | "}Lifeline:{" "}
        <a href="tel:131114" className="underline font-bold" aria-label="Call Lifeline 13 11 14">
          13 11 14
        </a>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <Link href="/chat" className="flex items-center space-x-2">
          <FredMorphIcon size={28} />
          <span className="font-semibold text-foreground">
            FRED
          </span>
        </Link>

        <nav className="flex items-center space-x-4">
          <Link
            href="/chat"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Chat
          </Link>
          <Link
            href="/resources"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Resources
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/crisis-flags" className="cursor-pointer">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Crisis Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/costs" className="cursor-pointer">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Cost Monitoring
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
