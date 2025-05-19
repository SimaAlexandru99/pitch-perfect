"use client";

import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {navigationData} from "@/constants";
import {usePathname} from "next/navigation";

function findPageTitle(pathname: string): string {
    // Helper to search in a list of items
    const search = (
        items: Array<{ [key: string]: unknown }>,
        key = "url",
        label = "title"
    ) =>
        items.find((item) => item[key] === pathname)?.[label] as string | undefined;

    // Search main nav
    let title = search(navigationData.navMain);
    if (title) return title;

    // Search navClouds and sub-items
    for (const cloud of navigationData.navClouds) {
        if (cloud.url === pathname) return cloud.title;
        if (cloud.items) {
            const sub = search(cloud.items);
            if (sub) return sub;
        }
    }

    // Search navSecondary
    title = search(navigationData.navSecondary);
    if (title) return title;

    // Search documents (label is 'name')
    title = search(navigationData.documents, "url", "name");
    if (title) return title;

    // Fallback
    return "Dashboard";
}

export function SiteHeader() {
    const pathname = usePathname();
    const pageTitle = findPageTitle(pathname);

    return (
        <header
            className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1"/>
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium">{pageTitle}</h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
                        <a
                            href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="dark:text-foreground"
                        >
                            GitHub
                        </a>
                    </Button>
                </div>
            </div>
        </header>
    );
}
