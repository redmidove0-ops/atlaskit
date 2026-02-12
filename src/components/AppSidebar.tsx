'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  Receipt,
  FileCheck,
  Truck,
  FileMinus,
  Building2,
  ChevronDown,
  Globe,
  Plus,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { routes } from '@/lib/routes';

export default function AppSidebar() {
  const t = useTranslations('nav');
  const tDoc = useTranslations('documents');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  const docSubItems = [
    {
      label: tDoc('invoices'),
      href: routes.documents(locale) + '?kind=invoice',
      icon: Receipt,
    },
    {
      label: tDoc('quotes'),
      href: routes.documents(locale) + '?kind=devis',
      icon: FileCheck,
    },
    {
      label: tDoc('deliveryNotes'),
      href: routes.documents(locale) + '?kind=bon_livraison',
      icon: Truck,
    },
    {
      label: tDoc('creditNotes'),
      href: routes.documents(locale) + '?kind=credit_note',
      icon: FileMinus,
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <Link href={routes.dashboard(locale)} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            A
          </div>
          <span className="text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            {tCommon('appName')}
          </span>
        </Link>
      </SidebarHeader>

      <Separator className="mx-4 w-auto" />

      <SidebarContent className="px-2 pt-2">
        {/* Quick Action */}
        <div className="px-2 mb-2 group-data-[collapsible=icon]:hidden">
          <Button size="sm" className="w-full gap-2" asChild>
            <Link href={routes.documentNew(locale)}>
              <Plus className="h-4 w-4" />
              {tDoc('newDocument')}
            </Link>
          </Button>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('main')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(routes.dashboard(locale))}
                  tooltip={t('dashboard')}
                >
                  <Link href={routes.dashboard(locale)}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{t('dashboard')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Documents with sub-items */}
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isActive(routes.documents(locale))}
                      tooltip={t('documents')}
                    >
                      <FileText className="h-4 w-4" />
                      <span>{t('documents')}</span>
                      <ChevronDown className="ms-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {/* All documents */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === routes.documents(locale)}>
                          <Link href={routes.documents(locale)}>
                            {tDoc('allDocuments')}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {docSubItems.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton asChild>
                            <Link href={item.href}>
                              <item.icon className="h-3.5 w-3.5" />
                              {item.label}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Clients */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(routes.clients(locale))}
                  tooltip={t('clients')}
                >
                  <Link href={routes.clients(locale)}>
                    <Users className="h-4 w-4" />
                    <span>{t('clients')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Products */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(routes.products(locale))}
                  tooltip={t('products')}
                >
                  <Link href={routes.products(locale)}>
                    <Package className="h-4 w-4" />
                    <span>{t('products')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('settings')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(routes.settingsCompany(locale))}
                  tooltip={t('company')}
                >
                  <Link href={routes.settingsCompany(locale)}>
                    <Building2 className="h-4 w-4" />
                    <span>{t('company')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(routes.settings(locale))}
                  tooltip={t('preferences')}
                >
                  <Link href={routes.settings(locale)}>
                    <Settings className="h-4 w-4" />
                    <span>{t('preferences')}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 group-data-[collapsible=icon]:hidden">
        <div className="rounded-lg border border-dashed p-3 text-center">
          <p className="text-xs text-muted-foreground">
            {tCommon('appName')} v1.0
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
