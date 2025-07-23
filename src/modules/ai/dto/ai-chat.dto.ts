import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsUrl,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum ContentType {
  TEXT = 'text',
  IMAGE_URL = 'image_url',
}

export class ImageUrlContent {
  @IsNotEmpty()
  @IsUrl()
  url: string;
}

export class MessageContent {
  @IsEnum(ContentType)
  type: ContentType;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageUrlContent)
  image_url?: ImageUrlContent;
}

export class ChatMessage {
  @IsEnum(MessageRole)
  role: MessageRole;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageContent)
  content: MessageContent[];
}

export class ChatCompletionRequestDto {
  @IsOptional()
  @IsString()
  model?: string = 'google/gemini-2.0-flash-001';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessage)
  messages: ChatMessage[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  max_tokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  top_p?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  frequency_penalty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  presence_penalty?: number;
}

export class SimpleTextRequestDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  model?: string = 'google/gemini-2.0-flash-001';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;
}

export class ImageAnalysisRequestDto {
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsString()
  question?: string = 'What is in this image?';

  @IsOptional()
  @IsString()
  model?: string = 'google/gemini-2.0-flash-001';
}
