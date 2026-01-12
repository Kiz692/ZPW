INSERT INTO sys_tenant (ten_name)
SELECT v.ten_name
FROM (
  VALUES ('Zimasa Demo Tenant A'), ('Zimasa Demo Tenant B')
) AS v(ten_name)
WHERE NOT EXISTS (
  SELECT 1
  FROM sys_tenant t
  WHERE t.ten_name = v.ten_name
);
