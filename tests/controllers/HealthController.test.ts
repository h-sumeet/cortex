import { HealthController } from '../../src/controllers/HealthController';

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(() => {
        controller = new HealthController();
    });

    test('should return health status', () => {
        const response = controller.getHealth();
        expect(response).toEqual({ status: 'ok' });
    });

    test('should handle unexpected errors', () => {
        jest.spyOn(controller, 'getHealth').mockImplementation(() => {
            throw new Error('Unexpected error');
        });
        expect(() => controller.getHealth()).toThrow('Unexpected error');
    });
});