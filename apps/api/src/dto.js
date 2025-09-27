import { IsInt, IsOptional, IsString, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type, plainToInstance } from 'class-transformer';

class MixDto {
  @IsString() size;
  @IsInt() @Min(0) @Max(100) pct;
}

export class ScopeInputDto {
  @IsInt() @Min(0) monthlyOrders;
  @IsInt() @Min(0) averageOrderValueCents;
  @IsInt() @Min(1) @IsOptional() averageUnitsPerOrder;

  @IsArray() @ValidateNested({ each: true }) @Type(() => MixDto) @IsOptional()
  shippingSizeMix;
}

export class PreviewDto {
  @IsString() @IsOptional() rateCardId;

  @ValidateNested() @Type(() => ScopeInputDto)
  scopeInput;
}

export function validateRequest(dtoClass) {
  return async (req, res, next) => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors = await import('class-validator').then(({ validate }) => validate(dto, { whitelist: true, forbidNonWhitelisted: true }));

    if (errors.length > 0) {
      const errorMessages = errors.map(error => Object.values(error.constraints)).flat();
      return res.status(400).json({ ok: false, error: "VALIDATION_ERROR", details: errorMessages });
    }
    req.validatedBody = dto;
    next();
  };
}
