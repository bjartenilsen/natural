import { wineRecordToRow, rowToWineRecord, validateWineRecord } from '../../src/repositories/DatabaseUtils';
import { WineRecord, WineRecordRow } from '../../src/types/WineTypes';

const createValidWineRecord = (overrides?: Partial<WineRecord>): WineRecord => ({
  id: 'wine_test_123',
  imageUri: 'file:///test/image.jpg',
  analysisResult: {
    isNaturalWine: true,
    confidenceScore: 85,
    explanation: 'This appears to be a natural wine based on the label.',
    timestamp: new Date('2025-01-01T00:00:00Z'),
  },
  consumed: false,
  location: {
    latitude: 59.9139,
    longitude: 10.7522,
    accuracy: 10,
  },
  notes: 'Great wine!',
  createdAt: new Date('2025-01-01T12:00:00Z'),
  ...overrides,
});

const createValidRow = (): WineRecordRow => ({
  id: 'wine_test_123',
  image_uri: 'file:///test/image.jpg',
  is_natural_wine: 1,
  confidence_score: 85,
  explanation: 'This appears to be a natural wine based on the label.',
  consumed: 0,
  latitude: 59.9139,
  longitude: 10.7522,
  location_accuracy: 10,
  notes: 'Great wine!',
  created_at: '2025-01-01T12:00:00.000Z',
  analysis_timestamp: '2025-01-01T00:00:00.000Z',
});

describe('wineRecordToRow', () => {
  it('converts a WineRecord to a database row', () => {
    const record = createValidWineRecord();
    const row = wineRecordToRow(record);

    expect(row.id).toBe('wine_test_123');
    expect(row.image_uri).toBe('file:///test/image.jpg');
    expect(row.is_natural_wine).toBe(1);
    expect(row.confidence_score).toBe(85);
    expect(row.consumed).toBe(0);
    expect(row.latitude).toBe(59.9139);
    expect(row.longitude).toBe(10.7522);
    expect(row.notes).toBe('Great wine!');
  });

  it('converts consumed: true to 1', () => {
    const record = createValidWineRecord({ consumed: true });
    const row = wineRecordToRow(record);
    expect(row.consumed).toBe(1);
  });

  it('converts isNaturalWine: false to 0', () => {
    const record = createValidWineRecord({
      analysisResult: {
        ...createValidWineRecord().analysisResult,
        isNaturalWine: false,
      },
    });
    const row = wineRecordToRow(record);
    expect(row.is_natural_wine).toBe(0);
  });

  it('handles missing location', () => {
    const record = createValidWineRecord({ location: undefined });
    const row = wineRecordToRow(record);
    expect(row.latitude).toBeUndefined();
    expect(row.longitude).toBeUndefined();
    expect(row.location_accuracy).toBeUndefined();
  });
});

describe('rowToWineRecord', () => {
  it('converts a database row to a WineRecord', () => {
    const row = createValidRow();
    const record = rowToWineRecord(row);

    expect(record.id).toBe('wine_test_123');
    expect(record.imageUri).toBe('file:///test/image.jpg');
    expect(record.analysisResult.isNaturalWine).toBe(true);
    expect(record.analysisResult.confidenceScore).toBe(85);
    expect(record.consumed).toBe(false);
    expect(record.location?.latitude).toBe(59.9139);
    expect(record.createdAt).toEqual(new Date('2025-01-01T12:00:00.000Z'));
  });

  it('converts is_natural_wine: 0 to false', () => {
    const row = { ...createValidRow(), is_natural_wine: 0 };
    const record = rowToWineRecord(row);
    expect(record.analysisResult.isNaturalWine).toBe(false);
  });

  it('handles missing location fields', () => {
    const row = { ...createValidRow(), latitude: undefined, longitude: undefined, location_accuracy: undefined };
    const record = rowToWineRecord(row);
    expect(record.location).toBeUndefined();
  });
});

describe('validateWineRecord', () => {
  it('validates a correct wine record', () => {
    const record = createValidWineRecord();
    const result = validateWineRecord(record);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects empty id', () => {
    const record = createValidWineRecord({ id: '' });
    const result = validateWineRecord(record);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Wine ID is required');
  });

  it('rejects empty imageUri', () => {
    const record = createValidWineRecord({ imageUri: '' });
    const result = validateWineRecord(record);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Image URI is required');
  });

  it('rejects confidence score out of range', () => {
    const record = createValidWineRecord({
      analysisResult: {
        ...createValidWineRecord().analysisResult,
        confidenceScore: 150,
      },
    });
    const result = validateWineRecord(record);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Confidence score must be a number between 0 and 100');
  });

  it('rejects invalid latitude', () => {
    const record = createValidWineRecord({
      location: { latitude: 200, longitude: 10, accuracy: 5 },
    });
    const result = validateWineRecord(record);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Latitude must be a number between -90 and 90');
  });

  it('rejects invalid longitude', () => {
    const record = createValidWineRecord({
      location: { latitude: 59, longitude: 300, accuracy: 5 },
    });
    const result = validateWineRecord(record);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Longitude must be a number between -180 and 180');
  });
});
