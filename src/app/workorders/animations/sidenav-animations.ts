import {
    animate,
    animation,
    query,
    sequence,
    stagger,
    style,
} from '@angular/animations';

export const SidenavOpenAnimation = animation([
    style({ left: '-{{menuWidth}}' }),
    query('mat-list-item', [style({ transform: 'translateX(-{{menuWidth}})' })], { optional: true }),
    sequence([
        animate('200ms', style({ left: '0' })),
        query('mat-list-item', [
            stagger(50, [animate('{{animationStyle}}', style({transform: 'none'}))])
        ], {optional: true})
    ])
]);


export const SidenavClosedAnimation = animation([
    style({ left: '0' }),
    query('mat-list-item', [style({ transform: 'none' })], { optional: true }),
    sequence([
        query('mat-list-item', [
            stagger(-50, [
                animate(
                    '{{animationStyle}}',
                    style({ transform: 'translateX(-{{menuWidth}})' })
                )
            ])
        ], { optional: true }),
        animate('200ms', style({ left: '-{{menuWidth}}' }))
    ])
]);