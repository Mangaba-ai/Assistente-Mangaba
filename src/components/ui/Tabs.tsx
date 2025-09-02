import React, { useState } from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }
  
  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content
  
  return (
    <div className={`w-full ${className}`}>
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {activeTabContent}
      </div>
    </div>
  )
}

export default Tabs