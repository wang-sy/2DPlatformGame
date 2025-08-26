export class MobileOptimization {
    
    static isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }
    
    static getOptimalResolution(): { width: number, height: number } {
        const isMobile = this.isMobile();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        if (isMobile) {
            const maxMobileWidth = 896;
            const maxMobileHeight = 672;
            
            const aspectRatio = 4/3;
            
            let width = Math.min(screenWidth, maxMobileWidth);
            let height = width / aspectRatio;
            
            if (height > screenHeight) {
                height = Math.min(screenHeight, maxMobileHeight);
                width = height * aspectRatio;
            }
            
            return {
                width: Math.floor(width),
                height: Math.floor(height)
            };
        }
        
        return {
            width: 1024,
            height: 768
        };
    }
    
    static getPixelRatio(): number {
        const isMobile = this.isMobile();
        
        if (isMobile) {
            const dpr = window.devicePixelRatio || 1;
            if (dpr > 2) return 2;
            if (dpr > 1.5) return 1.5;
            return 1;
        }
        
        return window.devicePixelRatio || 1;
    }
    
    static preventDefaultTouchBehaviors(): void {
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
        
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    static requestFullscreen(element: HTMLElement): void {
        if (!this.isMobile()) return;
        
        const requestFullscreen = element.requestFullscreen ||
                                (element as any).webkitRequestFullscreen ||
                                (element as any).mozRequestFullScreen ||
                                (element as any).msRequestFullscreen;
        
        if (requestFullscreen) {
            requestFullscreen.call(element);
        }
    }
    
    static lockOrientation(orientation: 'landscape' | 'portrait' = 'landscape'): void {
        if (!this.isMobile()) return;
        
        const screen = window.screen as any;
        
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock(orientation).catch((err: any) => {
                console.log('Orientation lock failed:', err);
            });
        } else if (screen.lockOrientation) {
            screen.lockOrientation(orientation);
        } else if (screen.mozLockOrientation) {
            screen.mozLockOrientation(orientation);
        } else if (screen.msLockOrientation) {
            screen.msLockOrientation(orientation);
        }
    }
    
    static enableWakeLock(): void {
        if (!this.isMobile()) return;
        
        if ('wakeLock' in navigator) {
            (navigator as any).wakeLock.request('screen').catch((err: any) => {
                console.log('Wake lock failed:', err);
            });
        }
    }
}