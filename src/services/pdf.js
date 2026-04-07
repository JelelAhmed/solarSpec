/**
 * SolarSpec PDF Service
 *
 * Architecture rule: lives exclusively in /src/services/pdf.js.
 * All PDF generation is gated through this file.
 * Never import RNHTMLtoPDF directly from a screen or component.
 *
 * Uses react-native-html-to-pdf to convert the proposal HTML template
 * into a sharable PDF file. Errors are always caught and reported.
 */

import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Share, Platform } from 'react-native';

import { buildProposalHTML } from '../templates/proposal';
import { generateProposalReference } from '../utils/calculations';
import { saveProposal, loadProposals } from './storage';

// ─── PDF GENERATION ──────────────────────────────────────────────────────────

/**
 * Generates a PDF from the proposal data, saves metadata to storage,
 * and returns the file path.
 *
 * @param {{
 *   clientInfo: object,
 *   systemConfig: object,
 *   sizing: object,
 *   appliances: Array,
 *   componentItems: Array,
 *   componentPrices: object,
 *   totalCost: number,
 *   businessName?: string,
 *   technicianName?: string,
 * }} proposalData
 * @returns {Promise<{ filePath: string, proposalRef: string } | null>}
 *   Returns null if PDF generation fails.
 */
export async function generatePDF(proposalData) {
  try {
    // Generate a proposal reference based on how many proposals are stored
    const existing = await loadProposals();
    const proposalRef = generateProposalReference(existing.length);
    const proposalDate = new Date();

    // Build the HTML content
    const htmlContent = buildProposalHTML({
      ...proposalData,
      proposalRef,
      proposalDate,
    });

    // Configure PDF options
    const options = {
      html: htmlContent,
      fileName: `SolarSpec_${proposalRef.replace(/-/g, '_')}`,
      directory: Platform.OS === 'ios' ? 'Documents' : 'Download',
      base64: false,
      height: 1122, // A4 height in px at 96dpi
      width: 794,   // A4 width in px at 96dpi
      padding: 0,
    };

    const pdf = await RNHTMLtoPDF.convert(options);

    if (!pdf?.filePath) {
      throw new Error('PDF generation returned no file path.');
    }

    // Persist proposal metadata to storage
    await saveProposal({
      ref: proposalRef,
      date: proposalDate.toISOString(),
      clientName: proposalData.clientInfo?.name ?? 'Unknown',
      totalCost: proposalData.totalCost ?? 0,
      filePath: pdf.filePath,
    });

    return { filePath: pdf.filePath, proposalRef };
  } catch (e) {
    console.error('generatePDF error:', e);
    return null;
  }
}

// ─── SHARE PDF ───────────────────────────────────────────────────────────────

/**
 * Shares an existing PDF file using the native share sheet.
 *
 * @param {string} filePath - Absolute path to the PDF file
 * @param {string} proposalRef - Proposal reference string for the share message
 * @returns {Promise<void>}
 */
export async function sharePDF(filePath, proposalRef) {
  try {
    const message = `SolarSpec Solar Proposal ${proposalRef}`;
    const url = Platform.OS === 'ios' ? filePath : `file://${filePath}`;

    await Share.share({
      title: message,
      message: Platform.OS === 'ios' ? message : `${message}\n${url}`,
      url: Platform.OS === 'ios' ? url : undefined,
    });
  } catch (e) {
    // User cancelled share is not an error
    if (e?.message !== 'User did not share') {
      console.error('sharePDF error:', e);
    }
  }
}

// ─── GENERATE AND SHARE ───────────────────────────────────────────────────────

/**
 * Convenience function: generates the PDF then immediately opens the share sheet.
 * Used by the "Share" FAB on the ProposalPreviewScreen.
 *
 * @param {object} proposalData - Full proposal data (same shape as generatePDF)
 * @param {Function} [onGenerating] - Called with true/false to toggle loading state
 * @returns {Promise<{ filePath: string, proposalRef: string } | null>}
 */
export async function generateAndShare(proposalData, onGenerating) {
  try {
    if (onGenerating) onGenerating(true);
    const result = await generatePDF(proposalData);
    if (result?.filePath) {
      await sharePDF(result.filePath, result.proposalRef);
    }
    return result;
  } catch (e) {
    console.error('generateAndShare error:', e);
    return null;
  } finally {
    if (onGenerating) onGenerating(false);
  }
}
