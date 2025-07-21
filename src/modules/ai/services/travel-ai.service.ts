import { Injectable, Logger } from '@nestjs/common';
import { OpenRouterService } from './openrouter.service';
import { ChatCompletionResponse } from '../interfaces/openrouter.interface';

@Injectable()
export class TravelAIService {
  private readonly logger = new Logger(TravelAIService.name);

  constructor(private readonly openRouterService: OpenRouterService) {}

  async generateTravelPlan(
    destination: string,
    duration?: string,
    budget?: string,
    interests?: string,
    travelStyle?: string,
    model?: string,
  ): Promise<ChatCompletionResponse> {
    const prompt = this.buildTravelPlanPrompt(
      destination,
      duration,
      budget,
      interests,
      travelStyle,
    );

    this.logger.log(`Generating travel plan for destination: ${destination}`);

    return this.openRouterService.simpleTextCompletion(
      prompt,
      model,
      0.7, // Creative but not too random
    );
  }

  async generateItinerary(
    destination: string,
    days: number,
    interests?: string[],
    model?: string,
  ): Promise<ChatCompletionResponse> {
    const prompt = this.buildItineraryPrompt(destination, days, interests);

    this.logger.log(
      `Generating ${days}-day itinerary for destination: ${destination}`,
    );

    return this.openRouterService.simpleTextCompletion(prompt, model, 0.6);
  }

  async getDestinationInfo(
    destination: string,
    model?: string,
  ): Promise<ChatCompletionResponse> {
    const prompt = `Provide comprehensive information about ${destination} as a travel destination. Include:
    
1. **Overview**: Brief description and what makes it special
2. **Best Time to Visit**: Seasonal information and weather
3. **Top Attractions**: Must-see places and activities
4. **Local Culture**: Customs, traditions, and etiquette
5. **Food & Cuisine**: Local specialties and dining recommendations
6. **Transportation**: How to get around
7. **Budget Tips**: Cost estimates and money-saving advice
8. **Safety & Health**: Important considerations for travelers
9. **Accommodation**: Types of lodging available
10. **Practical Tips**: Useful information for first-time visitors

Please provide detailed, accurate, and up-to-date information formatted in a clear, organized manner.`;

    this.logger.log(`Getting destination info for: ${destination}`);

    return this.openRouterService.simpleTextCompletion(prompt, model, 0.3);
  }

  async analyzeDestinationImage(
    imageUrl: string,
    model?: string,
  ): Promise<ChatCompletionResponse> {
    const question = `Analyze this travel destination image and provide:

1. **Location Identification**: Try to identify the specific location or type of destination
2. **Key Features**: Describe the main attractions or features visible
3. **Travel Appeal**: What makes this place attractive to tourists
4. **Best Activities**: Suggest activities that would be suitable here
5. **Travel Tips**: Any specific advice for visiting this type of location
6. **Similar Destinations**: Recommend similar places travelers might enjoy

Please provide detailed insights that would be helpful for travel planning.`;

    this.logger.log('Analyzing destination image');

    return this.openRouterService.imageAnalysis(imageUrl, question, model);
  }

  async getLocalRecommendations(
    destination: string,
    category: 'restaurants' | 'activities' | 'shopping' | 'nightlife' | 'all',
    model?: string,
  ): Promise<ChatCompletionResponse> {
    const prompt = this.buildRecommendationsPrompt(destination, category);

    this.logger.log(`Getting ${category} recommendations for: ${destination}`);

    return this.openRouterService.simpleTextCompletion(prompt, model, 0.5);
  }

  async getBudgetEstimate(
    destination: string,
    duration: string,
    travelStyle: 'budget' | 'mid-range' | 'luxury',
    groupSize: number = 1,
    model?: string,
  ): Promise<ChatCompletionResponse> {
    const prompt = `Provide a detailed budget estimate for a ${duration} trip to ${destination} for ${groupSize} ${groupSize === 1 ? 'person' : 'people'} with a ${travelStyle} travel style.

Break down the costs for:
1. **Flights**: Round-trip airfare estimates
2. **Accommodation**: Per night costs for ${travelStyle} options
3. **Food & Dining**: Daily meal costs
4. **Transportation**: Local transport and transfers
5. **Activities & Attractions**: Entry fees and tours
6. **Shopping & Souvenirs**: Typical spending
7. **Miscellaneous**: Tips, insurance, emergency fund

Provide:
- Daily budget breakdown
- Total estimated cost
- Money-saving tips
- Cost comparison with similar destinations
- Seasonal price variations

Use current market prices and provide estimates in USD.`;

    this.logger.log(
      `Generating budget estimate for ${travelStyle} trip to ${destination}`,
    );

    return this.openRouterService.simpleTextCompletion(prompt, model, 0.3);
  }

  private buildTravelPlanPrompt(
    destination: string,
    duration?: string,
    budget?: string,
    interests?: string,
    travelStyle?: string,
  ): string {
    let prompt = `Create a comprehensive travel plan for ${destination}`;

    if (duration) prompt += ` for ${duration}`;
    if (budget) prompt += ` with a budget of ${budget}`;
    if (travelStyle) prompt += ` in ${travelStyle} style`;

    prompt += `.\n\nPlease include:

1. **Trip Overview**: Summary of the planned experience
2. **Suggested Itinerary**: Day-by-day breakdown
3. **Accommodation Recommendations**: Where to stay
4. **Transportation**: How to get there and around
5. **Must-See Attractions**: Top places to visit
6. **Local Experiences**: Authentic cultural activities
7. **Food & Dining**: Restaurant and local cuisine recommendations
8. **Budget Breakdown**: Estimated costs
9. **Packing List**: What to bring
10. **Travel Tips**: Important advice and considerations`;

    if (interests) {
      prompt += `\n\nSpecial focus on: ${interests}`;
    }

    prompt += `\n\nProvide a detailed, practical, and personalized travel plan that maximizes the travel experience within the given parameters.`;

    return prompt;
  }

  private buildItineraryPrompt(
    destination: string,
    days: number,
    interests?: string[],
  ): string {
    let prompt = `Create a detailed ${days}-day itinerary for ${destination}.`;

    if (interests && interests.length > 0) {
      prompt += ` Focus on these interests: ${interests.join(', ')}.`;
    }

    prompt += `\n\nFor each day, provide:
- **Morning**: Activities and attractions (with timing)
- **Afternoon**: Continued activities and lunch recommendations
- **Evening**: Dinner and evening activities
- **Transportation**: How to get between locations
- **Tips**: Practical advice for each day

Make sure the itinerary is realistic, well-paced, and includes a good mix of must-see attractions, local experiences, and relaxation time.`;

    return prompt;
  }

  private buildRecommendationsPrompt(
    destination: string,
    category: string,
  ): string {
    const categoryMap = {
      restaurants: 'restaurants and local dining experiences',
      activities: 'activities and attractions',
      shopping: 'shopping areas and local markets',
      nightlife: 'nightlife and entertainment venues',
      all: 'restaurants, activities, shopping, and nightlife',
    };

    return `Recommend the best ${categoryMap[category]} in ${destination}.

For each recommendation, provide:
- **Name and Location**: Specific details
- **Description**: What makes it special
- **Price Range**: Budget expectations
- **Best Time to Visit**: Timing recommendations
- **Tips**: Insider advice

Focus on a mix of popular tourist spots and hidden local gems. Provide at least 5-10 quality recommendations with practical details.`;
  }
}
