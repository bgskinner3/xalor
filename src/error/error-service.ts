import { RUNTIME_SHAPE_VALIDATION_ERRORS } from '../models';

class RuntimeErrorService {
  public shapeValErrs = RUNTIME_SHAPE_VALIDATION_ERRORS;
}

export const errorService = new RuntimeErrorService();
