import { validate, validateSync } from 'class-validator';
import { plainToClass, Transform } from 'class-transformer';

class MixDto {
  size;
  pct;

  constructor(size, pct) {
    this.size = size;
    this.pct = pct;
  }
}

class ScopeInputDto {
  monthlyOrders;
  averageOrderValueCents;
  averageUnitsPerOrder = 1;
  shippingSizeMix = [];

  constructor(data) {
    this.monthlyOrders = data.monthlyOrders;
    this.averageOrderValueCents = data.averageOrderValueCents;
    this.averageUnitsPerOrder = data.averageUnitsPerOrder || 1;
    this.shippingSizeMix = data.shippingSizeMix || [];
  }
}

class PreviewDto {
  rateCardId = 'rc-launch';
  scopeInput;

  constructor(data) {
    this.rateCardId = data.rateCardId || 'rc-launch';
    this.scopeInput = new ScopeInputDto(data.scopeInput || {});
  }
}

// Validation middleware for Express
export function validateRequest(DtoClass) {
  return async (req, res, next) => {
    try {
      const dto = new DtoClass(req.body);
      const errors = await validate(dto);
      
      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        );
        return res.status(400).json({
          ok: false,
          error: 'VALIDATION_ERROR',
          details: errorMessages
        });
      }
      
      req.validatedBody = dto;
      next();
    } catch (err) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        details: [err.message]
      });
    }
  };
}

export { PreviewDto, ScopeInputDto, MixDto };
