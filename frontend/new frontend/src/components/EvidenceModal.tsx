import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

interface Paper {
  id: string;
  title: string;
  year: number | null;
  authors: string | null;
  abstract: string | null;
  pmid: string | null;
  doi: string | null;
}

interface EvidenceModalProps {
  open: boolean;
  onClose: () => void;
  sourceId: string;
  targetId: string;
  relationshipType: string | null;
  sourceName?: string;
  targetName?: string;
}

interface EvidenceData {
  found: boolean;
  source: string;
  target: string;
  relationship_type: string;
  relationship_properties: any;
  evidence_count: number;
  papers: Paper[];
  confidence: string;
  message?: string;
}

const EvidenceModal: React.FC<EvidenceModalProps> = ({
  open,
  onClose,
  sourceId,
  targetId,
  relationshipType,
  sourceName,
  targetName
}) => {
  const [evidence, setEvidence] = React.useState<EvidenceData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && sourceId && targetId) {
      fetchEvidence();
    }
  }, [open, sourceId, targetId, relationshipType]);

  const fetchEvidence = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/evidence/edge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_id: sourceId,
          target_id: targetId,
          relationship_type: relationshipType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch evidence');
      }

      const data: EvidenceData = await response.json();
      setEvidence(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
      case 'medium':
        return <CheckCircleIcon />;
      case 'low':
      case 'unverified':
        return <WarningIcon />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">📚 Evidence for Relationship</Typography>
          {evidence && (
            <Chip
              icon={getConfidenceIcon(evidence.confidence)}
              label={`${evidence.confidence} confidence`}
              color={getConfidenceColor(evidence.confidence) as any}
              size="small"
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {evidence && !loading && (
          <>
            {/* Relationship Summary */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Relationship
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip label={sourceName || evidence.source} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {evidence.relationship_type}
                </Typography>
                <Chip label={targetName || evidence.target} />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Evidence Count */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📊 Evidence Count: {evidence.evidence_count}
              </Typography>
              {evidence.evidence_count === 0 && (
                <Alert severity="warning">
                  No papers directly supporting this relationship were found in the knowledge graph.
                  This may indicate a derived or inferred relationship.
                </Alert>
              )}
            </Box>

            {/* Supporting Papers */}
            {evidence.papers.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  📄 Supporting Papers
                </Typography>
                <List>
                  {evidence.papers.map((paper, index) => (
                    <React.Fragment key={paper.id}>
                      {index > 0 && <Divider />}
                      <ListItem alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <ArticleIcon fontSize="small" color="primary" />
                              <Typography variant="subtitle1">
                                {paper.title}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              {paper.authors && (
                                <Typography variant="body2" color="text.secondary" component="div">
                                  <strong>Authors:</strong> {paper.authors.substring(0, 200)}
                                  {paper.authors.length > 200 ? '...' : ''}
                                </Typography>
                              )}
                              {paper.year && (
                                <Typography variant="body2" color="text.secondary" component="div">
                                  <strong>Year:</strong> {paper.year}
                                </Typography>
                              )}
                              {paper.abstract && (
                                <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 1 }}>
                                  {paper.abstract.substring(0, 300)}
                                  {paper.abstract.length > 300 ? '...' : ''}
                                </Typography>
                              )}
                              <Box display="flex" gap={1} mt={1}>
                                {paper.pmid && (
                                  <Link
                                    href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
                                    target="_blank"
                                    rel="noopener"
                                  >
                                    <Chip
                                      label="PubMed"
                                      size="small"
                                      icon={<OpenInNewIcon />}
                                      clickable
                                      component="a"
                                    />
                                  </Link>
                                )}
                                {paper.doi && (
                                  <Link
                                    href={`https://doi.org/${paper.doi}`}
                                    target="_blank"
                                    rel="noopener"
                                  >
                                    <Chip
                                      label="DOI"
                                      size="small"
                                      icon={<OpenInNewIcon />}
                                      clickable
                                      component="a"
                                    />
                                  </Link>
                                )}
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </>
            )}

            {!evidence.found && evidence.message && (
              <Alert severity="info">{evidence.message}</Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EvidenceModal;
