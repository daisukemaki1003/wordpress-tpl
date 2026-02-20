type Option = {
    config?: IntersectionObserver
    infinite?: boolean
    animation?: (param: IntersectionObserverEntry) => void
}

export const defaultAnime = ({ target }: { target: Element }) => {
    target.animate({ opacity: [0, 1] }, { duration: 600, easing: 'cubic-bezier(0.55, 0, 1, 0.45)', fill: 'forwards' });
    target.animate([{ transform: 'translateY(50px)' }, { transform: 'translateY(0)' }], {
        duration: 1000,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        delay: 100,
    })
}


export class scrollAnimations {
    config: {
        root: null
        rootMargin: string
        thresholds: Number[]
    }

    constructor() {
        this.config = {
            root: null,
            rootMargin: '-10% 0px',
            thresholds: [0],
        }
    }

    private createObserver(option: Option): IntersectionObserver {
        const ob = new IntersectionObserver(
            (en: IntersectionObserverEntry[]) => {
                for (const e of en) {
                    const { isIntersecting, target } = e
                    if (isIntersecting) {
                        if (option.animation) option.animation(e)
                        else defaultAnime(e)
                        if (!option.infinite) ob.unobserve(target);
                    }
                }
            },
            { ...this.config, ...option.config }
        )
        return ob
    }

    public add(el: HTMLElement | NodeListOf<Element>, option: Option = {}): void {
        const ob = this.createObserver(option)
        if (el instanceof HTMLElement) ob.observe(el)
        else for (const e of Array.from(el)) ob.observe(e)
    }
}

export default scrollAnimations
