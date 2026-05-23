import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";

import { cx } from "./utils";

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
}

export function Tabs({ items, defaultValue, className }: TabsProps) {
  return (
    <BaseTabs.Root defaultValue={defaultValue ?? items[0]?.value} className={cx("pv-tabs", className)}>
      <BaseTabs.List className="pv-tabs__list" aria-label="Pocket Vibe modes">
        {items.map((item) => (
          <BaseTabs.Tab key={item.value} className="pv-tabs__tab" value={item.value} disabled={item.disabled}>
            {item.label}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
      {items.map((item) => (
        <BaseTabs.Panel key={item.value} className="pv-tabs__panel" value={item.value} keepMounted>
          {item.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
