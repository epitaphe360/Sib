import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Navigation, ChevronDown } from 'lucide-react';
import { useNavVisibilityStore } from '../../../store/navVisibilityStore';

export function AdminNavVisibility() {
  const { items, setVisible } = useNavVisibilityStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleExpand = (key: string) => {
    setExpanded(prev => (prev === key ? null : key));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-indigo-500" />
              <h3 className="text-base font-bold text-indigo-900 tracking-wide uppercase" style={{ letterSpacing: '0.08em' }}>
                Visibilite du menu principal
              </h3>
            </div>
            <p className="text-xs mt-1 text-gray-500">
              Activez ou desactivez les items et sous-items du menu de navigation
            </p>
          </div>
          <div className="w-8 h-0.5 rounded-full bg-indigo-300" />
        </div>

        {/* Items */}
        <div className="space-y-2">
          {items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expanded === item.key;
            const visibleChildCount = item.children?.filter(c => c.visible).length ?? 0;
            const totalChildCount = item.children?.length ?? 0;

            return (
              <div key={item.key} className="rounded-xl border overflow-hidden"
                style={{ borderColor: item.visible ? '#c7d2fe' : '#e5e7eb' }}>

                {/* Parent row */}
                <div className={`flex items-center gap-3 px-4 py-3 ${item.visible ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                  {/* Toggle visibility */}
                  <button
                    onClick={() => setVisible(item.key, !item.visible)}
                    className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                      item.visible
                        ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                    }`}
                    title={item.visible ? 'Cacher' : 'Afficher'}
                  >
                    {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>

                  {/* Label */}
                  <span className={`flex-1 font-semibold text-sm ${item.visible ? 'text-indigo-900' : 'text-gray-400'}`}>
                    {item.label}
                  </span>

                  {/* Sub-item count badge */}
                  {hasChildren && (
                    <span className="text-[10px] text-gray-400 mr-1">
                      {visibleChildCount}/{totalChildCount} sous-items
                    </span>
                  )}

                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    item.visible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.visible ? 'bg-green-500' : 'bg-red-400'}`} />
                    {item.visible ? 'Visible' : 'Cache'}
                  </span>

                  {/* Expand button (only if has children) */}
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpand(item.key)}
                      className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                        isExpanded ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title="Gerer les sous-items"
                    >
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {/* Children */}
                <AnimatePresence>
                  {hasChildren && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 py-2 bg-white border-t border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {item.children!.map((child) => (
                            <div
                              key={child.key}
                              onClick={() => setVisible(child.key, !child.visible)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors select-none ${
                                child.visible
                                  ? 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-100'
                                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                              }`}
                            >
                              <span className={`flex-shrink-0 w-3.5 h-3.5 rounded flex items-center justify-center ${
                                child.visible ? 'text-indigo-500' : 'text-gray-300'
                              }`}>
                                {child.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                              </span>
                              <span className={`text-xs font-medium flex-1 ${child.visible ? 'text-indigo-800' : 'text-gray-400'}`}>
                                {child.label}
                              </span>
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${child.visible ? 'bg-green-400' : 'bg-red-300'}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-gray-400 mt-4">
          * Cliquez sur ChevronDown pour gerer les sous-items. Les changements sont appliques immediatement.
        </p>
      </div>
    </motion.div>
  );
}