import type { FastifyInstance } from 'fastify';
import { componentsSchemas } from './schemas';

function transformOpenApiToJsonSchema(obj: any): any {
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) return obj.map(transformOpenApiToJsonSchema);
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === '$ref' && typeof v === 'string' && v.startsWith('#/components/schemas/')) {
        const name = v.replace('#/components/schemas/', '');
        out['$ref'] = `${name}#`;
        continue;
      }
      if (k === 'example') {
        // Drop OpenAPI-only annotation to satisfy Ajv strict mode
        continue;
      }
      if (k === 'nullable' && v === true) {
        // Handle OpenAPI nullable -> JSON Schema union with null
        // Will be applied after we know the existing type; skip setting here
        // and post-process below after copying other props.
        out['__nullable'] = true;
        continue;
      }
      out[k] = transformOpenApiToJsonSchema(v as any);
    }

    // Post-process nullable union
    if (out['__nullable']) {
        delete out['__nullable'];
        if (typeof out.type === 'string') {
          out.type = [out.type, 'null'];
        } else if (Array.isArray(out.type)) {
          if (!out.type.includes('null')) out.type = [...out.type, 'null'];
        } else if (!out.type) {
          // If no explicit type, assume it can be null
          out.type = ['null'];
        }
    }
    return out;
  }
  return obj;
}

export async function registerJsonSchemas(app: FastifyInstance) {
  for (const [name, schema] of Object.entries(componentsSchemas)) {
    const transformed = transformOpenApiToJsonSchema(schema);
    app.addSchema({ $id: name, ...(transformed as object) });
  }
}
