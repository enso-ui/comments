import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { app } from '@enso-ui/ui/src/pinia/app';
import Comments from '../src/bulma/Comments.vue';
import Inputor from '../src/bulma/Inputor.vue';

describe('comments components', () => {
    beforeEach(() => {
        setActivePinia(createPinia());

        app().$patch({
            meta: { dateFormat: 'Y-m-d' },
            user: { id: 1 },
        });
    });

    it('creates comment drafts from the current user', () => {
        expect(Comments.methods.factory()).toEqual({
            body: '',
            taggedUsers: [],
            owner: { id: 1 },
        });
    });

    it('filters the current user from tag suggestions', async () => {
        const get = vi.fn().mockResolvedValue({
            data: [
                { id: 1, person: { name: 'Current User' } },
                { id: 2, person: { name: 'Another User' } },
            ],
        });

        const ctx = {
            errorHandler: vi.fn(),
            http: { get },
            items: [],
            position: null,
            query: 'a',
            route: value => value,
        };

        await Inputor.methods.fetch.call(ctx);

        expect(ctx.items).toEqual([
            { id: 2, person: { name: 'Another User' } },
        ]);
        expect(ctx.position).toBe(0);
    });
});
