/**
 * AI Service Usage Examples
 *
 * This file contains examples of how to use the AI services
 * in the TravelMate AI application.
 */

import { OpenRouterService } from '@/modules/ai/services/openrouter.service';
import { TravelAIService } from '@/modules/ai/services/travel-ai.service';
import {
  ChatCompletionRequestDto,
  SimpleTextRequestDto,
  ImageAnalysisRequestDto,
  TravelPlanRequestDto,
  MessageRole,
  ContentType,
} from '@/modules/ai/dto/ai-chat.dto';

export class AIUsageExamples {
  constructor(
    private readonly openRouterService: OpenRouterService,
    private readonly travelAIService: TravelAIService,
  ) {}

  /**
   * Example 1: Simple text completion
   */
  async simpleTextExample() {
    const request: SimpleTextRequestDto = {
      message: 'What are the best travel destinations in Southeast Asia?',
      model: 'google/gemini-2.0-flash-001',
      temperature: 0.7,
    };

    const response = await this.openRouterService.simpleTextCompletion(
      request.message,
      request.model,
      request.temperature,
    );

    console.log('Simple Text Response:', response.content);
    return response;
  }

  /**
   * Example 2: Image analysis
   */
  async imageAnalysisExample() {
    const request: ImageAnalysisRequestDto = {
      imageUrl:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
      question: 'What is in this image? Is this a good travel destination?',
      model: 'google/gemini-2.0-flash-001',
    };

    const response = await this.openRouterService.imageAnalysis(
      request.imageUrl,
      request.question,
      request.model,
    );

    console.log('Image Analysis Response:', response.content);
    return response;
  }

  /**
   * Example 3: Advanced chat completion with multiple content types
   */
  async advancedChatExample() {
    const request: ChatCompletionRequestDto = {
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: MessageRole.USER,
          content: [
            {
              type: ContentType.TEXT,
              text: 'Analyze this travel destination image and suggest a 3-day itinerary:',
            },
            {
              type: ContentType.IMAGE_URL,
              image_url: {
                url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
              },
            },
          ],
        },
      ],
      temperature: 0.6,
      max_tokens: 1000,
    };

    const openRouterRequest = {
      model: request.model!,
      messages: request.messages.map((msg) => ({
        role: msg.role,
        content: msg.content.map((content) => ({
          type: content.type,
          text: content.text,
          image_url: content.image_url,
        })),
      })),
      temperature: request.temperature,
      max_tokens: request.max_tokens,
    };

    const response =
      await this.openRouterService.chatCompletion(openRouterRequest);

    console.log('Advanced Chat Response:', response.content);
    return response;
  }

  /**
   * Example 4: Generate travel plan
   */
  async travelPlanExample() {
    const request: TravelPlanRequestDto = {
      destination: 'Tokyo, Japan',
      duration: '7 days',
      budget: '$2000-3000',
      interests: 'culture, food, technology, temples',
      travelStyle: 'mid-range',
      model: 'google/gemini-2.0-flash-001',
    };

    const response = await this.travelAIService.generateTravelPlan(
      request.destination,
      request.duration,
      request.budget,
      request.interests,
      request.travelStyle,
      request.model,
    );

    console.log('Travel Plan Response:', response.content);
    return response;
  }

  /**
   * Example 5: Get destination information
   */
  async destinationInfoExample() {
    const response = await this.travelAIService.getDestinationInfo(
      'Bali, Indonesia',
      'google/gemini-2.0-flash-001',
    );

    console.log('Destination Info Response:', response.content);
    return response;
  }

  /**
   * Example 6: Generate itinerary
   */
  async itineraryExample() {
    const response = await this.travelAIService.generateItinerary(
      'Paris, France',
      5,
      ['art', 'history', 'cuisine', 'architecture'],
      'google/gemini-2.0-flash-001',
    );

    console.log('Itinerary Response:', response.content);
    return response;
  }

  /**
   * Example 7: Get local recommendations
   */
  async recommendationsExample() {
    const response = await this.travelAIService.getLocalRecommendations(
      'New York City',
      'restaurants',
      'google/gemini-2.0-flash-001',
    );

    console.log('Recommendations Response:', response.content);
    return response;
  }

  /**
   * Example 8: Get budget estimate
   */
  async budgetEstimateExample() {
    const response = await this.travelAIService.getBudgetEstimate(
      'London, UK',
      '10 days',
      'mid-range',
      2,
      'google/gemini-2.0-flash-001',
    );

    console.log('Budget Estimate Response:', response.content);
    return response;
  }

  /**
   * Example 9: Analyze destination image
   */
  async destinationImageAnalysisExample() {
    const response = await this.travelAIService.analyzeDestinationImage(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
      'google/gemini-2.0-flash-001',
    );

    console.log('Destination Image Analysis Response:', response.content);
    return response;
  }

  /**
   * Example 10: Health check
   */
  async healthCheckExample() {
    const isHealthy = await this.openRouterService.healthCheck();
    console.log('OpenRouter Service Health:', isHealthy);
    return isHealthy;
  }

  /**
   * Run all examples
   */
  async runAllExamples() {
    console.log('=== AI Service Examples ===\n');

    try {
      console.log('1. Simple Text Example:');
      await this.simpleTextExample();
      console.log('\n');

      console.log('2. Image Analysis Example:');
      await this.imageAnalysisExample();
      console.log('\n');

      console.log('3. Advanced Chat Example:');
      await this.advancedChatExample();
      console.log('\n');

      console.log('4. Travel Plan Example:');
      await this.travelPlanExample();
      console.log('\n');

      console.log('5. Destination Info Example:');
      await this.destinationInfoExample();
      console.log('\n');

      console.log('6. Itinerary Example:');
      await this.itineraryExample();
      console.log('\n');

      console.log('7. Recommendations Example:');
      await this.recommendationsExample();
      console.log('\n');

      console.log('8. Budget Estimate Example:');
      await this.budgetEstimateExample();
      console.log('\n');

      console.log('9. Destination Image Analysis Example:');
      await this.destinationImageAnalysisExample();
      console.log('\n');

      console.log('10. Health Check Example:');
      await this.healthCheckExample();
      console.log('\n');

      console.log('=== All examples completed successfully! ===');
    } catch (error) {
      console.error('Example failed:', error.message);
    }
  }
}
