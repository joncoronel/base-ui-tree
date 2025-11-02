"use client";

import * as React from "react";
import {
  Tree,
  TreeItem,
  TreeItemContent,
  TreeItemIcon,
  TreeItemLabel,
  TreeItemBadge,
  type TreeNode,
  type TreeVariant,
} from "@/components/ui/tree";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useTheme } from "next-themes";
import {
  FolderIcon,
  FolderOpenIcon,
  FileIcon,
  FileTextIcon,
  ImageIcon,
  CodeIcon,
  PackageIcon,
  LoaderIcon,
  MoonIcon,
  SunIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

// Sample tree data with all features
const createTreeData = (): TreeNode[] => [
  {
    id: "src",
    name: "src",
    icon: <FolderIcon className="text-blue-500" />,
    iconOpen: <FolderOpenIcon className="text-blue-500" />,
    badge: <Badge variant="secondary">New</Badge>,
    children: [
      {
        id: "components",
        name: "components",
        icon: <FolderIcon className="text-blue-500" />,
        iconOpen: <FolderOpenIcon className="text-blue-500" />,
        badge: <Badge>12</Badge>,
        children: [
          {
            id: "ui",
            name: "ui",
            icon: <FolderIcon className="text-purple-500" />,
            iconOpen: <FolderOpenIcon className="text-purple-500" />,
            children: [
              {
                id: "button.tsx",
                name: "button.tsx",
                icon: <CodeIcon className="text-blue-400" />,
              },
              {
                id: "card.tsx",
                name: "card.tsx",
                icon: <CodeIcon className="text-blue-400" />,
              },
              {
                id: "dialog.tsx",
                name: "dialog.tsx",
                icon: <CodeIcon className="text-blue-400" />,
                badge: <Badge variant="danger">Error</Badge>,
              },
            ],
          },
          {
            id: "tree.tsx",
            name: "tree.tsx",
            icon: <CodeIcon className="text-blue-400" />,
            badge: <Badge variant="success">✓</Badge>,
          },
          {
            id: "form.tsx",
            name: "form.tsx",
            icon: <CodeIcon className="text-blue-400" />,
            disabled: true,
          },
        ],
      },
      {
        id: "lib",
        name: "lib",
        icon: <FolderIcon className="text-amber-500" />,
        iconOpen: <FolderOpenIcon className="text-amber-500" />,
        children: [
          {
            id: "utils.ts",
            name: "utils.ts",
            icon: <FileTextIcon className="text-gray-500" />,
          },
          {
            id: "hooks.ts",
            name: "hooks.ts",
            icon: <FileTextIcon className="text-gray-500" />,
            loading: true,
          },
        ],
      },
      {
        id: "app",
        name: "app",
        icon: <FolderIcon className="text-green-500" />,
        iconOpen: <FolderOpenIcon className="text-green-500" />,
        badge: <Badge variant="outline">3</Badge>,
        children: [
          {
            id: "page.tsx",
            name: "page.tsx",
            icon: <FileIcon className="text-orange-500" />,
          },
          {
            id: "layout.tsx",
            name: "layout.tsx",
            icon: <FileIcon className="text-orange-500" />,
          },
        ],
      },
    ],
  },
  {
    id: "public",
    name: "public",
    icon: <FolderIcon className="text-teal-500" />,
    iconOpen: <FolderOpenIcon className="text-teal-500" />,
    children: [
      {
        id: "images",
        name: "images",
        icon: <FolderIcon className="text-pink-500" />,
        iconOpen: <FolderOpenIcon className="text-pink-500" />,
        children: [
          {
            id: "logo.png",
            name: "logo.png",
            icon: <ImageIcon className="text-pink-400" />,
          },
          {
            id: "banner.jpg",
            name: "banner.jpg",
            icon: <ImageIcon className="text-pink-400" />,
          },
        ],
      },
    ],
  },
  {
    id: "package.json",
    name: "package.json",
    icon: <PackageIcon className="text-red-500" />,
  },
  {
    id: "README.md",
    name: "README.md",
    icon: <FileTextIcon className="text-blue-500" />,
    badge: <Badge variant="secondary">Docs</Badge>,
  },
];

export default function TestPage() {
  const [treeData] = React.useState<TreeNode[]>(createTreeData);
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
  const [checkedNodes, setCheckedNodes] = React.useState<string[]>([]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Feature toggles
  const [showCheckboxes, setShowCheckboxes] = React.useState(false);
  const [showLines, setShowLines] = React.useState(true);
  const [disableSelection, setDisableSelection] = React.useState(true);
  const [variant, setVariant] = React.useState<TreeVariant>("outline");

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center p-8">
      {/* Theme Toggle */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="bg-card border-border hover:bg-accent fixed top-6 right-6 z-50 rounded-md border p-2 shadow-sm transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <SunIcon className="size-4" />
          ) : (
            <MoonIcon className="size-4" />
          )}
        </button>
      )}
      {/* Main Tree Display */}
      <div className="w-full max-w-xs">
        <Tree
          data={treeData}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
          checkedNodes={checkedNodes}
          onCheckedNodesChange={setCheckedNodes}
          variant={variant}
          showLines={showLines}
          showCheckboxes={showCheckboxes}
          disableSelection={disableSelection}
          defaultExpanded={["src", "components"]}
        >
          {(item) => (
            <TreeItem item={item}>
              <TreeItemContent>
                {item.icon && <TreeItemIcon>{item.icon}</TreeItemIcon>}
                <TreeItemLabel>{item.name}</TreeItemLabel>
                {item.loading && (
                  <LoaderIcon className="text-muted-foreground size-4 animate-spin" />
                )}
                {item.badge && <TreeItemBadge>{item.badge}</TreeItemBadge>}
              </TreeItemContent>
            </TreeItem>
          )}
        </Tree>
      </div>

      {/* Mobile Drawer Trigger */}
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:hidden">
        <Drawer>
          <DrawerTrigger className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-full p-3 shadow-lg transition-colors">
            <SlidersHorizontalIcon className="size-5" />
          </DrawerTrigger>
          <DrawerContent>
            <div className="grid gap-3 p-5 pt-6">
              {/* Feature Toggles */}
              <div className="flex items-center justify-between">
                <Label htmlFor="checkboxes-mobile" className="cursor-pointer">
                  Show Checkboxes
                </Label>
                <Switch
                  id="checkboxes-mobile"
                  checked={showCheckboxes}
                  onCheckedChange={(checked) => {
                    setShowCheckboxes(checked);
                    if (checked) setShowLines(false);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="lines-mobile" className="cursor-pointer">
                  Show Lines
                </Label>
                <Switch
                  id="lines-mobile"
                  checked={showLines}
                  onCheckedChange={(checked) => {
                    setShowLines(checked);
                    if (checked) setShowCheckboxes(false);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="disable-selection-mobile"
                  className="cursor-pointer"
                >
                  Disable Selection
                </Label>
                <Switch
                  id="disable-selection-mobile"
                  checked={disableSelection}
                  onCheckedChange={setDisableSelection}
                />
              </div>

              {/* Variant Selection */}
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="variant-default-mobile"
                  className="cursor-pointer"
                >
                  Default Variant
                </Label>
                <Switch
                  id="variant-default-mobile"
                  checked={variant === "default"}
                  onCheckedChange={(checked) =>
                    checked && setVariant("default")
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="variant-nested-mobile"
                  className="cursor-pointer"
                >
                  Filled Variant
                </Label>
                <Switch
                  id="variant-nested-mobile"
                  checked={variant === "nested"}
                  onCheckedChange={(checked) => checked && setVariant("nested")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="variant-outline-mobile"
                  className="cursor-pointer"
                >
                  Outline Variant
                </Label>
                <Switch
                  id="variant-outline-mobile"
                  checked={variant === "outline"}
                  onCheckedChange={(checked) =>
                    checked && setVariant("outline")
                  }
                />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop Floating Control Panel */}
      <div className="fixed bottom-4 left-1/2 z-50 hidden w-full max-w-3xl -translate-x-1/2 md:block">
        <div className="border-border bg-card/95 supports-[backdrop-filter]:bg-card/90 mx-6 rounded-lg border p-3 shadow-lg backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature Toggles */}
            <div className="flex items-center justify-between">
              <Label htmlFor="checkboxes" className="cursor-pointer">
                Show Checkboxes
              </Label>
              <Switch
                id="checkboxes"
                checked={showCheckboxes}
                onCheckedChange={(checked) => {
                  setShowCheckboxes(checked);
                  if (checked) setShowLines(false);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lines" className="cursor-pointer">
                Show Lines
              </Label>
              <Switch
                id="lines"
                checked={showLines}
                onCheckedChange={(checked) => {
                  setShowLines(checked);
                  if (checked) setShowCheckboxes(false);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="disable-selection" className="cursor-pointer">
                Disable Selection
              </Label>
              <Switch
                id="disable-selection"
                checked={disableSelection}
                onCheckedChange={setDisableSelection}
              />
            </div>

            {/* Variant Selection */}
            <div className="flex items-center justify-between">
              <Label htmlFor="variant-default" className="cursor-pointer">
                Default Variant
              </Label>
              <Switch
                id="variant-default"
                checked={variant === "default"}
                onCheckedChange={(checked) => checked && setVariant("default")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="variant-nested" className="cursor-pointer">
                Filled Variant
              </Label>
              <Switch
                id="variant-nested"
                checked={variant === "nested"}
                onCheckedChange={(checked) => checked && setVariant("nested")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="variant-outline" className="cursor-pointer">
                Outline Variant
              </Label>
              <Switch
                id="variant-outline"
                checked={variant === "outline"}
                onCheckedChange={(checked) => checked && setVariant("outline")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
