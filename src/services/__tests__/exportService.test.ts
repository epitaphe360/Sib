/**
 * Tests unitaires pour exportService
 * Coverage critique
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { exportService } from '../exportService';

describe('ExportService', () => {
  const sampleData = [
    { id: 1, name: 'Test 1', email: 'test1@example.com', active: true },
    { id: 2, name: 'Test 2', email: 'test2@example.com', active: false },
    { id: 3, name: 'Test, Special', email: 'test3@example.com', active: true },
  ];

  describe('exportToCsv', () => {
    it('should export data to CSV format', async () => {
      const blob = await exportService.exportToCsv(sampleData);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/csv;charset=utf-8;');

      const text = await blob.text();
      expect(text).toContain('id,name,email,active');
      expect(text).toContain('1,Test 1,test1@example.com,true');
      expect(text).toContain('2,Test 2,test2@example.com,false');
    });

    it('should escape CSV values with commas', async () => {
      const blob = await exportService.exportToCsv(sampleData);
      const text = await blob.text();

      expect(text).toContain('"Test, Special"');
    });

    it('should use custom headers if provided', async () => {
      const blob = await exportService.exportToCsv(sampleData, {
        headers: ['ID', 'Nom', 'Email', 'Actif'],
        fields: ['id', 'name', 'email', 'active'],
      });

      const text = await blob.text();
      expect(text).toContain('ID,Nom,Email,Actif');
    });

    it('should throw error on empty data', async () => {
      await expect(exportService.exportToCsv([])).rejects.toThrow('No data to export');
    });
  });

  describe('exportToExcel', () => {
    it('should export data to Excel format', async () => {
      const blob = await exportService.exportToExcel(sampleData);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/vnd.ms-excel');
    });
  });

  describe('exportToJson', () => {
    it('should export data to JSON format', async () => {
      const blob = await exportService.exportToJson(sampleData);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');

      const text = await blob.text();
      const parsed = JSON.parse(text);

      expect(parsed).toEqual(sampleData);
    });
  });

  describe('exportToPdf', () => {
    it('should export data to HTML table for PDF', async () => {
      const blob = await exportService.exportToPdf(sampleData, {
        title: 'Test Report',
      });

      expect(blob).toBeInstanceOf(Blob);

      const html = await blob.text();
      expect(html).toContain('<table>');
      expect(html).toContain('<th>id</th>');
      expect(html).toContain('Test Report');
    });
  });

  describe('Entity-specific exports', () => {
    it('should export exhibitors correctly', async () => {
      const exhibitors = [
        {
          companyName: 'Company A',
          category: 'Tech',
          sector: 'IT',
          contactInfo: {
            email: 'contact@companya.com',
            phone: '+1234567890',
            city: 'Paris',
            country: 'France',
          },
          verified: true,
          featured: false,
        },
      ];

      // Mock download to avoid DOM manipulation in tests
      exportService.download = vi.fn();

      await exportService.exportExhibitors(exhibitors, 'csv');

      expect(exportService.download).toHaveBeenCalled();
    });
  });

  describe('Nested value extraction', () => {
    it('should get nested values correctly', async () => {
      const nestedData = [
        { id: 1, user: { name: 'John', profile: { age: 30 } } },
      ];

      const blob = await exportService.exportToCsv(nestedData, {
        headers: ['ID', 'Name', 'Age'],
        fields: ['id', 'user.name', 'user.profile.age'],
      });

      const text = await blob.text();
      expect(text).toContain('John');
      expect(text).toContain('30');
    });
  });
});
