import { supabase } from '../../utils/supabase';

describe('Supabase Utils', () => {
    describe('supabase client', () => {
        it('should be defined', () => {
            expect(supabase).toBeDefined();
        });

        it('should have auth property', () => {
            expect(supabase.auth).toBeDefined();
        });

        it('should have storage property', () => {
            expect(supabase.storage).toBeDefined();
        });
    });
});
