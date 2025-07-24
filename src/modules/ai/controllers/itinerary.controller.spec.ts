import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ItineraryController } from './itinerary.controller';
import { ItineraryAIService } from '../services/itinerary-ai.service';
import { ItineraryResponseDto, TripType } from '../dto/itinerary.dto';

describe('ItineraryController', () => {
  let controller: ItineraryController;
  let itineraryAIService: ItineraryAIService;

  const mockItineraryResponse: ItineraryResponseDto = {
    itineraryId: '507f1f77bcf86cd799439011',
    destination: 'Tokyo, Japan',
    startDate: '2024-03-15',
    endDate: '2024-03-20',
    numberOfTravelers: 2,
    preferences: ['culture', 'food'],
    tripType: TripType.MID_RANGE,
    aiSummary: 'A wonderful trip to Tokyo',
    aiSuggestions: ['Try sushi', 'Visit temples'],
    weatherSummary: 'Pleasant spring weather',
    chanceOfRain: 20,
    temperatureMin: 15,
    temperatureMax: 25,
    days: [],
    totalEstimatedCost: 2000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockItineraryAIService = {
    getUserItineraries: jest.fn().mockResolvedValue([mockItineraryResponse]),
    getItinerariesByUserId: jest
      .fn()
      .mockResolvedValue([mockItineraryResponse]),
    generateItinerary: jest.fn().mockResolvedValue(mockItineraryResponse),
    getItineraryById: jest.fn().mockResolvedValue(mockItineraryResponse),
    deleteItinerary: jest
      .fn()
      .mockResolvedValue({ message: 'Itinerary deleted successfully' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItineraryController],
      providers: [
        {
          provide: ItineraryAIService,
          useValue: mockItineraryAIService,
        },
      ],
    }).compile();

    controller = module.get<ItineraryController>(ItineraryController);
    itineraryAIService = module.get<ItineraryAIService>(ItineraryAIService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserItineraries', () => {
    it('should return user itineraries', async () => {
      const mockRequest = { user: { id: 'user123' } };

      const result = await controller.getUserItineraries(mockRequest);

      expect(result).toEqual([mockItineraryResponse]);
      expect(itineraryAIService.getUserItineraries).toHaveBeenCalledWith(
        'user123',
      );
    });

    it('should throw BadRequestException on service error', async () => {
      const mockRequest = { user: { id: 'user123' } };
      mockItineraryAIService.getUserItineraries.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(controller.getUserItineraries(mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllItinerariesByUserId', () => {
    it('should return all itineraries for a specific user', async () => {
      const userId = 'user123';

      const result = await controller.getAllItinerariesByUserId(userId);

      expect(result).toEqual([mockItineraryResponse]);
      expect(itineraryAIService.getItinerariesByUserId).toHaveBeenCalledWith(
        userId,
      );
    });

    it('should throw BadRequestException on service error', async () => {
      const userId = 'user123';
      mockItineraryAIService.getItinerariesByUserId.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(
        controller.getAllItinerariesByUserId(userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return empty array when user has no itineraries', async () => {
      const userId = 'user123';
      mockItineraryAIService.getItinerariesByUserId.mockResolvedValueOnce([]);

      const result = await controller.getAllItinerariesByUserId(userId);

      expect(result).toEqual([]);
      expect(itineraryAIService.getItinerariesByUserId).toHaveBeenCalledWith(
        userId,
      );
    });
  });

  describe('getItinerary', () => {
    it('should return a specific itinerary with full details', async () => {
      const mockRequest = { user: { id: 'user123' } };
      const itineraryId = '507f1f77bcf86cd799439011';

      const result = await controller.getItinerary(mockRequest, itineraryId);

      expect(result).toEqual(mockItineraryResponse);
      expect(itineraryAIService.getItineraryById).toHaveBeenCalledWith(
        itineraryId,
        'user123',
      );
    });

    it('should throw BadRequestException when itineraryId is empty', async () => {
      const mockRequest = { user: { id: 'user123' } };

      await expect(controller.getItinerary(mockRequest, '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when itinerary not found', async () => {
      const mockRequest = { user: { id: 'user123' } };
      const itineraryId = '507f1f77bcf86cd799439011';

      mockItineraryAIService.getItineraryById.mockRejectedValueOnce(
        new Error(
          'Itinerary not found or you do not have permission to access it',
        ),
      );

      await expect(
        controller.getItinerary(mockRequest, itineraryId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on service error', async () => {
      const mockRequest = { user: { id: 'user123' } };
      const itineraryId = '507f1f77bcf86cd799439011';

      mockItineraryAIService.getItineraryById.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(
        controller.getItinerary(mockRequest, itineraryId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteItinerary', () => {
    it('should delete an itinerary successfully', async () => {
      const mockRequest = { user: { id: 'user123' } };
      const itineraryId = '507f1f77bcf86cd799439011';

      const result = await controller.deleteItinerary(mockRequest, itineraryId);

      expect(result).toEqual({ message: 'Itinerary deleted successfully' });
      expect(itineraryAIService.deleteItinerary).toHaveBeenCalledWith(
        itineraryId,
        'user123',
      );
    });

    it('should throw BadRequestException when itineraryId is empty', async () => {
      const mockRequest = { user: { id: 'user123' } };

      await expect(controller.deleteItinerary(mockRequest, '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when itinerary not found', async () => {
      const mockRequest = { user: { id: 'user123' } };
      const itineraryId = '507f1f77bcf86cd799439011';

      mockItineraryAIService.deleteItinerary.mockRejectedValueOnce(
        new Error(
          'Itinerary not found or you do not have permission to delete it',
        ),
      );

      await expect(
        controller.deleteItinerary(mockRequest, itineraryId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on service error', async () => {
      const mockRequest = { user: { id: 'user123' } };
      const itineraryId = '507f1f77bcf86cd799439011';

      mockItineraryAIService.deleteItinerary.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(
        controller.deleteItinerary(mockRequest, itineraryId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
