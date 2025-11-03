"use client";

import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui-components/react/collapsible";
import { CheckboxGroup } from "@base-ui-components/react/checkbox-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRightIcon } from "lucide-react";
import { mergeProps } from "@base-ui-components/react";
import { useRender } from "@base-ui-components/react/use-render";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface TreeNode<TData = unknown> {
  id: string;
  name: string;
  children?: TreeNode<TData>[];
  data?: TData;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconOpen?: React.ReactNode;
  badge?: React.ReactNode;
}

type TreeVariant = "default" | "nested" | "outline";

// ============================================================================
// Context
// ============================================================================

interface TreeContextValue<TData = unknown> {
  selectedNode?: string | null;
  onNodeSelect?: (nodeId: string) => void;
  expandedNodes: Set<string>;
  onToggleNode: (nodeId: string) => void;
  checkedNodes?: Set<string>;
  onCheckedNodesChange?: (checked: string[]) => void;
  renderItem: (item: TreeNode<TData>) => React.ReactElement;
  variant: TreeVariant;
  showLines: boolean;
  enableBulkActions: boolean;
  disableSelection: boolean;
  focusableNodes: React.MutableRefObject<Map<string, HTMLElement>>;
  visibleNodeIds: string[];
  disabledNodesMap: Map<string, boolean>;
  parentNodeMap: Map<string, string>;
  lastFocusedNodeId: string | null;
  setLastFocusedNodeId: (nodeId: string | null) => void;
  data: TreeNode<TData>[];
}

const TreeContext = React.createContext<TreeContextValue | null>(null);

function useTreeContext<TData = unknown>(): TreeContextValue<TData> {
  const context = React.useContext(
    TreeContext,
  ) as TreeContextValue<TData> | null;
  if (!context) {
    throw new Error("Tree components must be used within a Tree");
  }
  return context;
}

interface TreeItemContextValue<TData = unknown> {
  item: TreeNode<TData>;
  depth: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasChildren: boolean;
}

const TreeItemContext = React.createContext<TreeItemContextValue | null>(null);

function useTreeItemContext<TData = unknown>(): TreeItemContextValue<TData> {
  const context = React.useContext(
    TreeItemContext,
  ) as TreeItemContextValue<TData> | null;
  if (!context) {
    throw new Error("TreeItem subcomponents must be used within TreeItem");
  }
  return context;
}

// ============================================================================
// Tree Root
// ============================================================================

export interface TreeProps<TData = unknown>
  extends Omit<useRender.ComponentProps<"div">, "children"> {
  data: TreeNode<TData>[];
  children: (item: TreeNode<TData>) => React.ReactElement;
  selectedNode?: string | null;
  onNodeSelect?: (nodeId: string) => void;
  defaultExpanded?: string[];
  expanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  checkedNodes?: string[];
  onCheckedNodesChange?: (checked: string[]) => void;
  variant?: TreeVariant;
  showLines?: boolean;
  enableBulkActions?: boolean;
  disableSelection?: boolean;
}

function Tree<TData = unknown>({
  data,
  children: renderItem,
  selectedNode,
  onNodeSelect,
  defaultExpanded = [],
  expanded,
  onExpandedChange,
  checkedNodes,
  onCheckedNodesChange,
  variant = "default",
  showLines = false,
  enableBulkActions = false,
  disableSelection = false,
  className,
  render,
  ...props
}: TreeProps<TData>): React.ReactElement {
  const [internalExpanded, setInternalExpanded] = React.useState<Set<string>>(
    new Set(defaultExpanded),
  );

  const focusableNodes = React.useRef<Map<string, HTMLElement>>(new Map());
  const [lastFocusedNodeId, setLastFocusedNodeId] = React.useState<
    string | null
  >(null);

  const expandedNodes = React.useMemo(() => {
    return expanded ? new Set(expanded) : internalExpanded;
  }, [expanded, internalExpanded]);

  const handleToggleNode = React.useCallback(
    (nodeId: string) => {
      const newExpanded = new Set(expandedNodes);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }

      if (expanded && onExpandedChange) {
        onExpandedChange(Array.from(newExpanded));
      } else {
        setInternalExpanded(newExpanded);
      }
    },
    [expandedNodes, expanded, onExpandedChange],
  );

  const checkedNodesSet = React.useMemo(() => {
    return checkedNodes ? new Set(checkedNodes) : undefined;
  }, [checkedNodes]);

  // Compute parent node map for ALL nodes (not just visible ones)
  const parentNodeMap = React.useMemo(() => {
    const parentMap = new Map<string, string>();

    const buildParentMap = (
      nodes: TreeNode<TData>[],
      parentId?: string,
    ): void => {
      for (const node of nodes) {
        if (parentId) {
          parentMap.set(node.id, parentId);
        }
        if (node.children) {
          buildParentMap(node.children, node.id);
        }
      }
    };

    buildParentMap(data);
    return parentMap;
  }, [data]);

  // Compute visible node IDs and disabled node map synchronously so it's available on first render
  const { visibleNodeIds, disabledNodesMap } = React.useMemo(() => {
    const ids: string[] = [];
    const disabledMap = new Map<string, boolean>();

    const collectVisibleIds = (nodes: TreeNode<TData>[]): void => {
      for (const node of nodes) {
        ids.push(node.id);
        if (node.disabled) {
          disabledMap.set(node.id, true);
        }
        if (node.children && expandedNodes.has(node.id)) {
          collectVisibleIds(node.children);
        }
      }
    };

    collectVisibleIds(data);
    return { visibleNodeIds: ids, disabledNodesMap: disabledMap };
  }, [data, expandedNodes]);

  const contextValue = React.useMemo(
    () => ({
      selectedNode,
      onNodeSelect,
      expandedNodes,
      onToggleNode: handleToggleNode,
      checkedNodes: checkedNodesSet,
      onCheckedNodesChange,
      renderItem: renderItem as (item: TreeNode<unknown>) => React.ReactElement,
      variant,
      showLines,
      enableBulkActions,
      disableSelection,
      focusableNodes,
      visibleNodeIds,
      disabledNodesMap,
      parentNodeMap,
      lastFocusedNodeId,
      setLastFocusedNodeId,
      data,
    }),
    [
      selectedNode,
      onNodeSelect,
      expandedNodes,
      handleToggleNode,
      checkedNodesSet,
      onCheckedNodesChange,
      renderItem,
      variant,
      showLines,
      enableBulkActions,
      disableSelection,
      visibleNodeIds,
      disabledNodesMap,
      parentNodeMap,
      lastFocusedNodeId,
      data,
    ],
  );

  const defaultProps = {
    "data-slot": "tree",
    className: cn(
      "w-full min-w-0 text-sm",
      variant === "nested" &&
        "ring ring-border/60 ring-1 bg-muted rounded-2xl p-2 shadow-sm",
      variant === "outline" &&
        "overflow-hidden rounded-2xl ring ring-border/60 bg-card p-2 shadow-lg",
      className,
    ),
    role: "tree",
    "aria-multiselectable": enableBulkActions,
    children: (
      <TreeContext.Provider value={contextValue}>
        {data.map((node) => (
          <TreeItemInternal key={node.id} node={node} depth={0} />
        ))}
      </TreeContext.Provider>
    ),
  };

  const element = useRender({
    defaultTagName: "div",
    render: render,
    props: mergeProps<"div">(defaultProps, props),
  });

  return element;
}

// ============================================================================
// Helper Components (Internal)
// ============================================================================

interface VerticalLineProps {
  paddingLeft: number;
}

function VerticalLine({ paddingLeft }: VerticalLineProps) {
  return (
    <div
      className="absolute top-0 bottom-0 left-0"
      style={{ left: paddingLeft - VERTICAL_LINE_OFFSET }}
    >
      <div className="bg-border h-full w-px" />
    </div>
  );
}

interface ParentCheckboxProps {
  disabled?: boolean;
  tabIndex?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function ParentCheckbox({
  disabled,
  tabIndex,
  className,
  onClick,
}: ParentCheckboxProps) {
  return (
    <Checkbox
      parent
      disabled={disabled}
      tabIndex={tabIndex}
      className={className}
      onClick={onClick}
    />
  );
}

// ============================================================================
// Constants
// ============================================================================

const INDENT_SIZE = 20;
const INDENT_SIZE_WITH_CHECKBOX = 12;
const VERTICAL_LINE_OFFSET = 4.5;
const CHILD_VERTICAL_LINE_OFFSET = 15.5;

// ============================================================================
// Helper Functions - Defined outside component for stable references
// ============================================================================

function getAllDescendantIds<TData>(children: TreeNode<TData>[]): string[] {
  const ids: string[] = [];
  for (const child of children) {
    ids.push(child.id);
    if (child.children && child.children.length > 0) {
      ids.push(...getAllDescendantIds(child.children));
    }
  }
  return ids;
}

function getLeafNodeIds<TData>(nodes: TreeNode<TData>[]): string[] {
  const leafIds: string[] = [];
  for (const childNode of nodes) {
    if (!childNode.children || childNode.children.length === 0) {
      leafIds.push(childNode.id);
    } else {
      leafIds.push(...getLeafNodeIds(childNode.children));
    }
  }
  return leafIds;
}

/**
 * Updates parent nodes based on their children's checked state.
 * A parent is checked if all its leaf descendants are checked.
 */
function updateParentCheckStates<TData>(
  nodes: TreeNode<TData>[],
  checkedSet: Set<string>,
): void {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      // Recursively update children first (bottom-up)
      updateParentCheckStates(node.children, checkedSet);

      // Get all leaf descendants of this parent
      const leafIds = getLeafNodeIds(node.children);

      // Parent should be checked if all leaf descendants are checked
      const allLeavesChecked = leafIds.every((id) => checkedSet.has(id));

      if (allLeavesChecked) {
        checkedSet.add(node.id);
      } else {
        checkedSet.delete(node.id);
      }
    }
  }
}

// ============================================================================
// Shared Rendering Components
// ============================================================================

interface TreeItemContainerProps {
  paddingLeft: number;
  showLines: boolean;
  depth: number;
  isSelected: boolean;
  isDisabled: boolean;
  disableSelection: boolean;
  children: React.ReactNode;
}

/**
 * Shared container structure for both leaf and parent tree items.
 * Handles padding, vertical lines, and hover/selection styling.
 */
function TreeItemContainer({
  paddingLeft,
  showLines,
  depth,
  isSelected,
  isDisabled,
  disableSelection,
  children,
}: TreeItemContainerProps) {
  return (
    <div className="group relative flex select-none" style={{ paddingLeft }}>
      {showLines && depth > 0 && <VerticalLine paddingLeft={paddingLeft} />}
      <div
        className={cn(
          "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
          "hover:bg-accent",
          isSelected && !disableSelection && "bg-accent text-accent-foreground",
          isDisabled && "cursor-not-allowed opacity-50",
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Custom Hooks
// ============================================================================

interface UseTreeCheckboxStateParams<TData> {
  node: TreeNode<TData>;
  hasChildren: boolean;
  context: TreeContextValue<TData>;
}

interface UseTreeCheckboxStateReturn {
  allDescendantIds: string[];
  localChildValues: string[];
  handleLocalCheckboxChange: (newValues: string[]) => void;
}

function useTreeCheckboxState<TData>({
  node,
  hasChildren,
  context,
}: UseTreeCheckboxStateParams<TData>): UseTreeCheckboxStateReturn {
  // Memoize the results of calling helper functions (defined outside component)
  const allDescendantIds = React.useMemo(
    () => (hasChildren ? getAllDescendantIds(node.children || []) : []),
    [hasChildren, node.children],
  );

  const allLeafIds = React.useMemo(
    () => (hasChildren ? getLeafNodeIds(node.children || []) : []),
    [hasChildren, node.children],
  );

  const localChildValues = React.useMemo(() => {
    if (!hasChildren || !context.checkedNodes || !context.enableBulkActions)
      return [];
    return allDescendantIds.filter((id) => context.checkedNodes!.has(id));
  }, [
    hasChildren,
    context.checkedNodes,
    allDescendantIds,
    context.enableBulkActions,
  ]);

  const handleLocalCheckboxChange = React.useCallback(
    (newValues: string[]) => {
      if (!context.onCheckedNodesChange || !context.checkedNodes) return;

      const currentSet = new Set(context.checkedNodes);

      // Remove all descendants
      for (const id of allDescendantIds) {
        currentSet.delete(id);
      }

      // Add back the selected values (these are all descendants now)
      for (const id of newValues) {
        currentSet.add(id);
      }

      // Update all parent nodes based on their children's checked state
      // This will correctly set all ancestors (parent, grandparent, etc.)
      updateParentCheckStates(context.data, currentSet);

      context.onCheckedNodesChange(Array.from(currentSet));
    },
    [context, allDescendantIds],
  );

  return {
    allDescendantIds,
    localChildValues,
    handleLocalCheckboxChange,
  };
}

// ============================================================================
// TreeItemInternal - Handles recursion internally
// ============================================================================

interface TreeItemInternalProps<TData = unknown> {
  node: TreeNode<TData>;
  depth: number;
}

const TreeItemInternal = React.memo(
  function TreeItemInternal<TData = unknown>({
    node,
    depth,
  }: TreeItemInternalProps<TData>): React.ReactElement {
    const context = useTreeContext<TData>();

    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = context.expandedNodes.has(node.id);
    const isSelected = context.selectedNode === node.id;
    const isDisabled = node.disabled || false;
    const isChecked =
      context.enableBulkActions && context.checkedNodes
        ? context.checkedNodes.has(node.id)
        : false;

    // Roving tabindex: only the last focused node should be tabbable
    // If no node has been focused yet, the first node is tabbable
    const isFirstNode = context.visibleNodeIds[0] === node.id;
    const isLastFocused = context.lastFocusedNodeId === node.id;
    const isTabbable =
      isLastFocused || (!context.lastFocusedNodeId && isFirstNode);

    const itemContextValue = React.useMemo(
      () => ({
        item: node,
        depth,
        isExpanded,
        isSelected,
        hasChildren,
      }),
      [node, depth, isExpanded, isSelected, hasChildren],
    );

    const handleToggleChecked = React.useCallback(() => {
      if (!context.onCheckedNodesChange || !context.checkedNodes) return;

      const currentSet = new Set(context.checkedNodes);
      const allDescendantIds = hasChildren
        ? getAllDescendantIds(node.children || [])
        : [];

      if (isChecked) {
        // Uncheck this node and all descendants
        currentSet.delete(node.id);
        for (const id of allDescendantIds) {
          currentSet.delete(id);
        }
      } else {
        // Check this node and all descendants
        currentSet.add(node.id);
        for (const id of allDescendantIds) {
          currentSet.add(id);
        }
      }

      // Update all parent nodes based on their children's checked state
      updateParentCheckStates(context.data, currentSet);

      context.onCheckedNodesChange(Array.from(currentSet));
    }, [context, isChecked, node.id, node.children, hasChildren]);

    const handleClick = React.useCallback(
      (e: React.MouseEvent) => {
        if (isDisabled) return;
        e.stopPropagation();

        if (context.enableBulkActions) {
          handleToggleChecked();
        } else if (!context.disableSelection) {
          context.onNodeSelect?.(node.id);
        }
      },
      [context, node.id, isDisabled, handleToggleChecked],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (isDisabled) return;

        const currentIndex = context.visibleNodeIds.indexOf(node.id);

        switch (e.key) {
          case " ":
            e.preventDefault();
            e.stopPropagation(); // Prevent Collapsible from handling
            if (context.enableBulkActions) {
              // When bulk actions enabled, Space toggles checked state ONLY
              handleToggleChecked();
            } else {
              // Otherwise, Space expands/collapses and selects
              if (hasChildren) {
                context.onToggleNode(node.id);
              }
              if (!context.disableSelection) {
                context.onNodeSelect?.(node.id);
              }
            }
            break;
          case "Enter":
            e.preventDefault();
            e.stopPropagation(); // Prevent Collapsible from handling
            if (context.enableBulkActions) {
              // When bulk actions enabled:
              // - Parent nodes: Enter expands/collapses
              // - Leaf nodes: Enter toggles checkbox (default action)
              if (hasChildren) {
                context.onToggleNode(node.id);
              } else {
                handleToggleChecked();
              }
            } else {
              // When bulk actions NOT enabled, Enter expands/collapses and selects
              if (hasChildren) {
                context.onToggleNode(node.id);
              }
              if (!context.disableSelection) {
                context.onNodeSelect?.(node.id);
              }
            }
            break;
          case "ArrowRight":
            e.preventDefault();
            if (hasChildren && !isExpanded) {
              context.onToggleNode(node.id);
            }
            break;
          case "ArrowLeft":
            e.preventDefault();
            if (hasChildren && isExpanded) {
              // If node is expanded, collapse it
              context.onToggleNode(node.id);
            } else {
              // If node is collapsed or is a leaf, focus parent
              const parentId = context.parentNodeMap.get(node.id);
              if (parentId) {
                const parentElement =
                  context.focusableNodes.current.get(parentId);
                if (parentElement) {
                  parentElement.focus();
                  context.setLastFocusedNodeId(parentId);
                }
              }
            }
            break;
          case "ArrowDown": {
            e.preventDefault();
            // Find next non-disabled node
            let nextIndex = currentIndex + 1;
            while (nextIndex < context.visibleNodeIds.length) {
              const nextId = context.visibleNodeIds[nextIndex];
              // Skip if node is disabled
              if (context.disabledNodesMap.has(nextId)) {
                nextIndex++;
                continue;
              }
              const nextElement = context.focusableNodes.current.get(nextId);
              if (nextElement) {
                nextElement.focus();
                context.setLastFocusedNodeId(nextId);
                break;
              }
              nextIndex++;
            }
            break;
          }
          case "ArrowUp": {
            e.preventDefault();
            // Find previous non-disabled node
            let prevIndex = currentIndex - 1;
            while (prevIndex >= 0) {
              const prevId = context.visibleNodeIds[prevIndex];
              // Skip if node is disabled
              if (context.disabledNodesMap.has(prevId)) {
                prevIndex--;
                continue;
              }
              const prevElement = context.focusableNodes.current.get(prevId);
              if (prevElement) {
                prevElement.focus();
                context.setLastFocusedNodeId(prevId);
                break;
              }
              prevIndex--;
            }
            break;
          }
          case "Home": {
            e.preventDefault();
            // Find first non-disabled node
            for (let i = 0; i < context.visibleNodeIds.length; i++) {
              const firstId = context.visibleNodeIds[i];
              if (context.disabledNodesMap.has(firstId)) continue;
              const firstElement = context.focusableNodes.current.get(firstId);
              if (firstElement) {
                firstElement.focus();
                context.setLastFocusedNodeId(firstId);
                break;
              }
            }
            break;
          }
          case "End": {
            e.preventDefault();
            // Find last non-disabled node
            for (let i = context.visibleNodeIds.length - 1; i >= 0; i--) {
              const lastId = context.visibleNodeIds[i];
              if (context.disabledNodesMap.has(lastId)) continue;
              const lastElement = context.focusableNodes.current.get(lastId);
              if (lastElement) {
                lastElement.focus();
                context.setLastFocusedNodeId(lastId);
                break;
              }
            }
            break;
          }
        }
      },
      [
        hasChildren,
        isExpanded,
        context,
        node.id,
        isDisabled,
        handleToggleChecked,
      ],
    );

    const paddingLeft =
      depth *
      (context.enableBulkActions ? INDENT_SIZE_WITH_CHECKBOX : INDENT_SIZE);

    // ============================================================================
    // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
    // ============================================================================

    // Checkbox state management (extracted to custom hook for clarity)
    const { allDescendantIds, localChildValues, handleLocalCheckboxChange } =
      useTreeCheckboxState({
        node,
        hasChildren,
        context,
      });

    // ============================================================================
    // NOW SAFE TO HAVE CONDITIONAL RETURNS
    // ============================================================================

    // Render leaf node (no children)
    if (!hasChildren) {
      return (
        <TreeItemContext.Provider value={itemContextValue}>
          <div className={cn("mt-0.5 first:mt-0")}>
            <TreeItemContainer
              paddingLeft={paddingLeft}
              showLines={context.showLines}
              depth={depth}
              isSelected={isSelected}
              isDisabled={isDisabled}
              disableSelection={context.disableSelection}
            >
              <div
                ref={(el) => {
                  if (el) {
                    context.focusableNodes.current.set(node.id, el);
                  } else {
                    context.focusableNodes.current.delete(node.id);
                  }
                }}
                className={cn(
                  "-my-1.5 flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 transition-colors outline-none select-none",
                  "-mx-2",
                  "focus-visible:bg-accent focus-visible:ring-ring/50 focus-visible:ring-2",
                  !isDisabled && "cursor-pointer",
                )}
                onClick={handleClick}
                onKeyDown={(e) => {
                  // Prevent Collapsible.Trigger from handling Space/Enter
                  // since we handle them ourselves in handleKeyDown
                  if (e.key === " " || e.key === "Enter") {
                    e.stopPropagation();
                  }
                  handleKeyDown(e);
                }}
                onFocus={() => {
                  context.setLastFocusedNodeId(node.id);
                }}
                role="treeitem"
                aria-selected={
                  context.enableBulkActions ? undefined : isSelected
                }
                aria-checked={context.enableBulkActions ? isChecked : undefined}
                aria-disabled={isDisabled}
                tabIndex={isDisabled ? -1 : isTabbable ? 0 : -1}
              >
                {context.enableBulkActions && (
                  <Checkbox
                    value={node.id}
                    checked={isChecked}
                    disabled={isDisabled}
                    tabIndex={-1}
                    className="pointer-events-none"
                  />
                )}
                {context.renderItem(node)}
              </div>
            </TreeItemContainer>
          </div>
        </TreeItemContext.Provider>
      );
    }

    // Render parent node (has children)

    const parentContent = (
      <TreeItemContext.Provider value={itemContextValue}>
        <div
          role="treeitem"
          aria-expanded={isExpanded}
          aria-selected={context.enableBulkActions ? undefined : isSelected}
          aria-checked={context.enableBulkActions ? isChecked : undefined}
          aria-disabled={isDisabled}
          className={cn("mt-0.5 first:mt-0")}
        >
          <BaseCollapsible.Root
            open={isExpanded}
            onOpenChange={() => !isDisabled && context.onToggleNode(node.id)}
          >
            <TreeItemContainer
              paddingLeft={paddingLeft}
              showLines={context.showLines}
              depth={depth}
              isSelected={isSelected}
              isDisabled={isDisabled}
              disableSelection={context.disableSelection}
            >
              {context.enableBulkActions ? (
                // In bulk actions mode, use plain div to avoid Collapsible.Trigger keyboard handling
                <div
                  ref={(el) => {
                    if (el) {
                      context.focusableNodes.current.set(node.id, el);
                    } else {
                      context.focusableNodes.current.delete(node.id);
                    }
                  }}
                  className={cn(
                    "group/trigger -mx-2 -my-1.5 flex flex-1 items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1.5 text-left transition-colors outline-none select-none",
                    "focus-visible:bg-accent focus-visible:ring-ring/50 focus-visible:ring-2",
                    !isDisabled && "cursor-pointer",
                  )}
                  onClick={() => {
                    // Clicking node text/content expands/collapses
                    if (!isDisabled) {
                      context.onToggleNode(node.id);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    context.setLastFocusedNodeId(node.id);
                  }}
                  tabIndex={isDisabled ? -1 : isTabbable ? 0 : -1}
                >
                  <span
                    onClick={(e: React.MouseEvent) => {
                      // Clicking checkbox toggles checked state
                      e.stopPropagation();
                      handleToggleChecked();
                    }}
                  >
                    <ParentCheckbox
                      disabled={isDisabled}
                      tabIndex={-1}
                      className="pointer-events-auto cursor-pointer"
                    />
                  </span>
                  <ChevronRightIcon
                    aria-hidden="true"
                    className={cn(
                      "text-muted-foreground ease-out-cubic size-4 shrink-0 transition-transform duration-325",
                      isExpanded && "rotate-90",
                      isDisabled && "opacity-50",
                    )}
                  />
                  {context.renderItem(node)}
                </div>
              ) : (
                // In navigation/selection mode, use Collapsible.Trigger for built-in behavior
                <BaseCollapsible.Trigger
                  ref={(el) => {
                    if (el) {
                      context.focusableNodes.current.set(node.id, el);
                    } else {
                      context.focusableNodes.current.delete(node.id);
                    }
                  }}
                  className={cn(
                    "group/trigger -mx-2 -my-1.5 flex flex-1 items-center gap-2 rounded-md border-0 bg-transparent px-2 py-1.5 text-left transition-colors outline-none select-none",
                    "focus-visible:bg-accent focus-visible:ring-ring/50 focus-visible:ring-2",
                    !isDisabled && "cursor-pointer",
                  )}
                  onClick={(e) => {
                    if (!isDisabled && !context.disableSelection) {
                      handleClick(e);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    context.setLastFocusedNodeId(node.id);
                  }}
                  disabled={isDisabled}
                  tabIndex={isDisabled ? -1 : isTabbable ? 0 : -1}
                >
                  <ChevronRightIcon
                    aria-hidden="true"
                    className={cn(
                      "text-muted-foreground ease-out-cubic size-4 shrink-0 transition-transform duration-325",
                      isExpanded && "rotate-90",
                      isDisabled && "opacity-50",
                    )}
                  />
                  {context.renderItem(node)}
                </BaseCollapsible.Trigger>
              )}
            </TreeItemContainer>

            <BaseCollapsible.Panel
              className={cn(
                "ease-out-cubic h-[var(--collapsible-panel-height)] overflow-y-clip transition-all duration-325",
                "data-[ending-style]:h-0 data-[ending-style]:opacity-0",
                "data-[starting-style]:h-0 data-[starting-style]:opacity-0",
              )}
            >
              <div
                className={cn(
                  context.showLines && "relative",
                  "pt-0.5 pb-0.5 pl-0",
                )}
              >
                {context.showLines && (
                  <div
                    className="bg-border absolute top-0 bottom-0 w-px"
                    style={{ left: paddingLeft + CHILD_VERTICAL_LINE_OFFSET }}
                  />
                )}
                {node.children?.map((child) => (
                  <TreeItemInternal
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                  />
                ))}
              </div>
            </BaseCollapsible.Panel>
          </BaseCollapsible.Root>
        </div>
      </TreeItemContext.Provider>
    );

    if (context.enableBulkActions) {
      return (
        <CheckboxGroup
          value={localChildValues}
          onValueChange={handleLocalCheckboxChange}
          allValues={allDescendantIds}
        >
          {parentContent}
        </CheckboxGroup>
      );
    }

    return parentContent;
  },
  (prevProps, nextProps) => {
    // Only re-render if the node reference or depth changed
    // This prevents re-renders when context values like lastFocusedNodeId change
    return (
      prevProps.node === nextProps.node && prevProps.depth === nextProps.depth
    );
  },
) as <TData = unknown>(
  props: TreeItemInternalProps<TData>,
) => React.ReactElement;

// ============================================================================
// TreeItem Component (Public API)
// ============================================================================

export interface TreeItemProps<TData = unknown> {
  item: TreeNode<TData>;
  children: React.ReactNode;
}

function TreeItem<TData = unknown>({ children }: TreeItemProps<TData>) {
  // TreeItem is just a wrapper that provides the content
  // The actual rendering happens in TreeItemInternal
  return <>{children}</>;
}

// ============================================================================
// TreeItemContent Component
// ============================================================================

export interface TreeItemContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function TreeItemContent({
  className,
  children,
  ...props
}: TreeItemContentProps) {
  return (
    <div
      data-slot="tree-item-content"
      className={cn("flex flex-1 items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// TreeItemIcon Component
// ============================================================================

export interface TreeItemIconProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

function TreeItemIcon({ children, className, ...props }: TreeItemIconProps) {
  const { item, isExpanded } = useTreeItemContext();

  const displayIcon = isExpanded && item.iconOpen ? item.iconOpen : children;

  if (!displayIcon) return null;

  return (
    <span
      data-slot="tree-item-icon"
      className={cn("text-muted-foreground shrink-0 [&>svg]:size-4", className)}
      {...props}
    >
      {displayIcon}
    </span>
  );
}

// ============================================================================
// TreeItemLabel Component
// ============================================================================

export interface TreeItemLabelProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

function TreeItemLabel({ children, className, ...props }: TreeItemLabelProps) {
  if (!children) return null;

  return (
    <span
      data-slot="tree-item-label"
      className={cn("truncate", className)}
      {...props}
    >
      {children}
    </span>
  );
}

// ============================================================================
// TreeItemBadge Component
// ============================================================================

export interface TreeItemBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

function TreeItemBadge({ children, className, ...props }: TreeItemBadgeProps) {
  if (!children) return null;

  return (
    <span
      data-slot="tree-item-badge"
      className={cn(
        "ml-auto flex shrink-0 items-center",
        // Scale down badges to match tree text size and prevent height increase
        "[&_[data-slot=badge]]:py-0.5 [&_[data-slot=badge]]:text-[10px] [&_[data-slot=badge]]:leading-tight",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ============================================================================
// Exports
// ============================================================================

export {
  Tree,
  TreeItem,
  TreeItemContent,
  TreeItemIcon,
  TreeItemLabel,
  TreeItemBadge,
  type TreeVariant,
};
