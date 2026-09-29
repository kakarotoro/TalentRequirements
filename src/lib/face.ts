import {
  RekognitionClient,
  CompareFacesCommand,
  DetectFacesCommand,
} from "@aws-sdk/client-rekognition";

function getRekognitionClient() {
  const region = process.env.AWS_REGION || "ap-southeast-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    return null; // Mock / Dev mode fallback
  }

  return new RekognitionClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export interface FaceComparisonResult {
  similarity: number;
  matched: boolean;
  faceCountSource: number;
  faceCountTarget: number;
  flags: string[];
}

/**
 * Compare two face images (buffer) using AWS Rekognition.
 */
export async function compareFaces(
  sourceImageBytes: Buffer,
  targetImageBytes: Buffer,
  threshold: number = 80
): Promise<FaceComparisonResult> {
  const client = getRekognitionClient();

  if (!client) {
    console.warn("AWS credentials not provided. Returning simulated face comparison result.");
    return {
      similarity: 94.5,
      matched: true,
      faceCountSource: 1,
      faceCountTarget: 1,
      flags: [],
    };
  }

  const flags: string[] = [];

  try {
    const command = new CompareFacesCommand({
      SourceImage: { Bytes: sourceImageBytes },
      TargetImage: { Bytes: targetImageBytes },
      SimilarityThreshold: threshold,
    });

    const response = await client.send(command);

    const match = response.FaceMatches?.[0];
    const similarity = match?.Similarity ?? 0;
    const isMatched = (match?.Similarity ?? 0) >= threshold;

    if (!isMatched) {
      flags.push("LOW_MATCH");
    }

    const unmatchedTargetFaces = response.UnmatchedFaces?.length || 0;
    const totalTargetFaces = (response.FaceMatches?.length || 0) + unmatchedTargetFaces;
    if (totalTargetFaces > 1) {
      flags.push("MULTIPLE_FACES");
    } else if (totalTargetFaces === 0) {
      flags.push("NO_FACE_DETECTED");
    }

    return {
      similarity,
      matched: isMatched,
      faceCountSource: 1,
      faceCountTarget: totalTargetFaces,
      flags,
    };
  } catch (error: any) {
    console.error("Rekognition compareFaces error:", error);
    flags.push("FACE_COMPARE_ERROR");
    return {
      similarity: 0,
      matched: false,
      faceCountSource: 0,
      faceCountTarget: 0,
      flags,
    };
  }
}

/**
 * Detect faces in a single image (e.g. check for single clear face in selfie or frame).
 */
export async function detectFacesInImage(
  imageBytes: Buffer
): Promise<{ faceCount: number; hasSingleFace: boolean; flags: string[] }> {
  const client = getRekognitionClient();

  if (!client) {
    return { faceCount: 1, hasSingleFace: true, flags: [] };
  }

  const flags: string[] = [];

  try {
    const command = new DetectFacesCommand({
      Image: { Bytes: imageBytes },
      Attributes: ["DEFAULT"],
    });

    const response = await client.send(command);
    const faceCount = response.FaceDetails?.length || 0;

    if (faceCount === 0) {
      flags.push("NO_FACE_DETECTED");
    } else if (faceCount > 1) {
      flags.push("MULTIPLE_FACES");
    }

    return {
      faceCount,
      hasSingleFace: faceCount === 1,
      flags,
    };
  } catch (err: any) {
    console.error("Rekognition detectFaces error:", err);
    flags.push("FACE_DETECTION_ERROR");
    return { faceCount: 0, hasSingleFace: false, flags };
  }
}
