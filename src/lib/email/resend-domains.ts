export type ResendDnsRecord = {
  type: string;
  name: string;
  value: string;
  status?: string;
  priority?: number;
};

export type ResendDomainStatus = {
  domain: string;
  verified: boolean;
  status: string;
  records: ResendDnsRecord[];
};

type ResendDomainApi = {
  id: string;
  name: string;
  status: string;
  records?: ResendDnsRecord[];
};

async function resendFetch<T>(path: string): Promise<T> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");

  const res = await fetch(`https://api.resend.com${path}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Resend API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function checkResendDomain(domain: string): Promise<ResendDomainStatus> {
  const normalized = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

  if (!normalized) {
    throw new Error("Domain is required");
  }

  const { data } = await resendFetch<{ data: ResendDomainApi[] }>("/domains");
  const match = data.find((d) => d.name === normalized);

  if (!match) {
    return {
      domain: normalized,
      verified: false,
      status: "not_found",
      records: [],
    };
  }

  const verified = match.status === "verified";
  return {
    domain: normalized,
    verified,
    status: match.status,
    records: match.records ?? [],
  };
}
