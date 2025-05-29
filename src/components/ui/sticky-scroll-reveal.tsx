"use client";
import { cn } from "@/lib/utils";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import React, { useRef, useState } from "react";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<React.ReactNode | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;
  const [imageScale, setImageScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        const accBreakpoint = cardsBreakpoints[acc];
        if (accBreakpoint !== undefined && distance < Math.abs(latest - accBreakpoint)) {
          return index;
        }
        return acc;
      },
      0,
    );
    setActiveCard(closestBreakpointIndex);
  });

  // 监听图片加载状态
  React.useEffect(() => {
    if (!showPreview) return undefined;

    const handleImageLoad = () => {
      setIsImageLoading(false);
    };

    const handleImageError = () => {
      setIsImageLoading(false);
    };

    // 查找所有图片元素
    const images = document.querySelectorAll('#preview-content img');
    if (images.length > 0) {
      setIsImageLoading(true);
      
      images.forEach(img => {
        const imgElement = img as HTMLImageElement;
        if (imgElement.complete) {
          setIsImageLoading(false);
        } else {
          imgElement.addEventListener('load', handleImageLoad);
          imgElement.addEventListener('error', handleImageError);
        }
      });
      
      return () => {
        images.forEach(img => {
          const imgElement = img as HTMLImageElement;
          imgElement.removeEventListener('load', handleImageLoad);
          imgElement.removeEventListener('error', handleImageError);
        });
      };
    }
    return undefined;
  }, [showPreview, previewContent]);

  const handleImageClick = (content: React.ReactNode) => {
    setPreviewContent(content);
    setShowPreview(true);
    setIsImageLoading(true);
    // 重置缩放和拖拽状态
    setImageScale(1);
    setDragOffset({ x: 0, y: 0 });
    // 确保模态框打开后页面不会滚动
    document.body.style.overflow = 'hidden';
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewContent(null);
    document.body.style.overflow = '';
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!showPreview) return;
    e.preventDefault();
    
    const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setImageScale(prevScale => {
      const newScale = prevScale * scaleFactor;
      return Math.min(Math.max(newScale, 0.5), 5);
    });
  };
  
  const handleDragStart = (e: React.MouseEvent) => {
    if (!showPreview || imageScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setDragOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const PreviewModal = () => {
    if (!showPreview) return null;
    
    // 处理键盘事件
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closePreview();
        } else if (e.key === '0') {
          // 重置缩放
          setImageScale(1);
          setDragOffset({ x: 0, y: 0 });
        } else if (e.key === '+' || e.key === '=') {
          // 放大
          setImageScale(prev => Math.min(prev * 1.1, 5));
        } else if (e.key === '-') {
          // 缩小
          setImageScale(prev => Math.max(prev * 0.9, 0.5));
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    
    // 使用useEffect确保组件挂载后聚焦到预览内容
    React.useEffect(() => {
      const modalContent = document.getElementById('preview-modal-content');
      if (modalContent) {
        modalContent.focus();
      }
    }, []);
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={closePreview}
      >
        <div 
          id="preview-modal-content"
          className="relative max-w-4xl w-[90%] max-h-[80vh] overflow-hidden p-4 rounded-lg"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          onWheel={handleWheel}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          style={{ cursor: isDragging ? 'grabbing' : imageScale > 1 ? 'grab' : 'default' }}
        >
          <div className="absolute top-4 left-4 flex space-x-2 z-10">
            <button 
              className="bg-white/10 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/20 transition-colors"
              onClick={() => setImageScale(prev => Math.min(prev * 1.1, 5))}
              aria-label="放大"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
            <button 
              className="bg-white/10 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/20 transition-colors"
              onClick={() => setImageScale(prev => Math.max(prev * 0.9, 0.5))}
              aria-label="缩小"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </button>
            <button 
              className="bg-white/10 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/20 transition-colors"
              onClick={() => { setImageScale(1); setDragOffset({ x: 0, y: 0 }); }}
              aria-label="重置"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          </div>
          
          <button 
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/20 transition-colors z-10"
            onClick={closePreview}
            aria-label="关闭预览"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-500 dark:text-gray-400 text-center p-1 rounded">
            使用鼠标滚轮或按钮进行缩放 • 点击并拖动移动图片 • 按ESC关闭
          </div>
          
          {/* 加载指示器 */}
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-5">
              <div className="w-10 h-10 border-2 border-blue-500/70 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
          
          <div 
            id="preview-content"
            ref={imageRef}
            className="transform transition-all flex items-center justify-center min-h-[50vh]"
            style={{ 
              transform: `scale(${imageScale}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
              transformOrigin: 'center',
            }}
          >
            {previewContent}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className="relative flex h-[30rem] justify-center space-x-10 overflow-y-auto rounded-md p-10"
        ref={ref}
      >
        <div className="div relative flex items-start px-4">
          <div className="max-w-2xl">
            {content.map((item, index) => (
              <div key={item.title + index} className="my-20">
                <motion.h2
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.3,
                  }}
                  className="text-2xl font-bold text-gray-900 dark:text-slate-100"
                >
                  {item.title}
                </motion.h2>
                <motion.p
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.3,
                  }}
                  className="text-kg mt-10 max-w-sm text-gray-700 dark:text-slate-300"
                >
                  {item.description}
                </motion.p>
              </div>
            ))}
            <div className="h-40" />
          </div>
        </div>
        <div
          className={cn(
            "sticky top-10 hidden h-60 w-80 overflow-hidden rounded-md lg:block cursor-pointer transition-transform hover:scale-[1.02]",
            contentClassName,
          )}
        >
          {content && activeCard >= 0 && activeCard < content.length && content[activeCard]?.content && (
            <div onClick={() => content[activeCard]?.content && handleImageClick(content[activeCard].content)}>
              {content[activeCard].content}
            </div>
          )}
        </div>
      </div>

      {/* 预览模态框 */}
      <PreviewModal />
    </>
  );
};
