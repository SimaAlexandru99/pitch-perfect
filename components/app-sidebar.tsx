"use client";

import {IconInnerShadowTop} from "@tabler/icons-react";
import Link from "next/link";
import * as React from "react";

import {NavDocuments} from "@/components/nav-documents";
import {NavMain} from "@/components/nav-main";
import {NavSecondary} from "@/components/nav-secondary";
import {NavUser} from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {navigationData} from "@/constants";

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
    user: User | null;
};

export function AppSidebar({user, ...props}: AppSidebarProps) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link href="/dashboard">
                                <IconInnerShadowTop className="!size-5"/>
                                <span className="text-base font-semibold">PitchPerfect AI</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navigationData.navMain}/>
                <NavDocuments items={navigationData.documents}/>
                <NavSecondary items={navigationData.navSecondary} className="mt-auto"/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user}/>
            </SidebarFooter>
        </Sidebar>
    );
}
