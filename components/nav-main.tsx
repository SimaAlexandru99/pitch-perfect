"use client";

import { IconCirclePlusFilled } from "@tabler/icons-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { QuickCreateDialog } from "@/components/quick-create-dialog";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const pathname = usePathname();
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Dialog
              open={isQuickCreateOpen}
              onOpenChange={setIsQuickCreateOpen}
            >
              <DialogTrigger asChild>
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                  onClick={() => setIsQuickCreateOpen(true)}
                >
                  <IconCirclePlusFilled />
                  <span>Quick Create</span>
                </SidebarMenuButton>
              </DialogTrigger>
              {isQuickCreateOpen && (
                <QuickCreateDialog
                  onClose={() => setIsQuickCreateOpen(false)}
                />
              )}
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={
                    isActive ? "bg-primary/10 text-primary font-semibold" : ""
                  }
                >
                  <Link href={item.url}>
                    {item.icon && (
                      <item.icon className={isActive ? "text-primary" : ""} />
                    )}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
